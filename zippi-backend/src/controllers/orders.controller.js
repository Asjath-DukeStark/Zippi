const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const STATUSES = ['pending', 'preparing', 'dispatched', 'arriving', 'delivered', 'cancelled'];
// Allowed transitions per role
const RIDER_FLOW = { dispatched: ['arriving'], arriving: ['delivered'] };

const ORDER_SELECT = `
  *,
  items:order_items ( id, product_id, quantity, price, product:products ( id, name, unit, image_url ) ),
  customer:users!orders_user_id_fkey ( id, name, phone ),
  rider:users!orders_rider_id_fkey ( id, name, phone )
`;

const genOrderNumber = () =>
  `ZP-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, '0')}`;

const logEvent = async (orderId, status, actorId, note = null) => {
  await supabase.from('order_events').insert({ order_id: orderId, status, actor_id: actorId, note });
};

/** POST /api/orders - place an order (customer / mobile clients) */
exports.create = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Fetch authoritative prices & stock
    const ids = items.map((i) => i.productId);
    const { data: products, error: pErr } = await supabase
      .from('products').select('id, name, price, stock, is_active').in('id', ids);
    if (pErr) throw new ApiError(pErr.message, 500, 'DB_ERROR');

    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const p = byId[it.productId];
      if (!p || p.is_active === false) throw new ApiError(`Product unavailable: ${it.productId}`, 422, 'PRODUCT_UNAVAILABLE');
      if (p.stock !== null && p.stock < it.quantity) throw new ApiError(`Insufficient stock for ${p.name}`, 422, 'OUT_OF_STOCK');
      subtotal += Number(p.price) * it.quantity;
      orderItems.push({ product_id: p.id, quantity: it.quantity, price: p.price });
    }

    // Delivery fee from settings (fallback defaults)
    const { data: s } = await supabase.from('settings').select('value').eq('key', 'delivery').maybeSingle();
    const cfg = s?.value || {};
    const freeAbove = Number(cfg.freeDeliveryAbove ?? 99);
    const baseFee = Number(cfg.deliveryFee ?? 4.99);
    const deliveryFee = subtotal >= freeAbove ? 0 : baseFee;

    // Promo code (server-side validation & discount computation)
    let discount = 0;
    let promoCode = null;
    if (req.body.promoCode) {
      const { evaluate } = require('./promotions.controller');
      const code = String(req.body.promoCode).trim().toUpperCase();
      const { data: promo } = await supabase.from('promotions').select('*').eq('code', code).maybeSingle();
      const result = evaluate(promo, subtotal);
      if (!result.valid) throw new ApiError(result.reason, 422, 'INVALID_PROMO');
      discount = result.discount;
      promoCode = code;
      await supabase.from('promotions').update({ used_count: (promo.used_count || 0) + 1 }).eq('id', promo.id);
    }
    const total = Math.max(0, subtotal + deliveryFee - discount);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: genOrderNumber(),
        user_id: req.user.id,
        subtotal, delivery_fee: deliveryFee, discount, total,
        promo_code: promoCode,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || null,
        status: 'pending',
        delivery_eta_min: Number(cfg.etaMinutes ?? 30)
      })
      .select('*')
      .single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    const { error: iErr } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
    if (iErr) throw new ApiError(iErr.message, 500, 'DB_ERROR');

    // Decrement stock (best-effort)
    for (const it of orderItems) {
      const p = byId[it.product_id];
      if (p.stock !== null) {
        await supabase.from('products').update({ stock: Math.max(0, p.stock - it.quantity) }).eq('id', p.id);
      }
    }
    await logEvent(order.id, 'pending', req.user.id, 'Order placed');

    const { data: full } = await supabase.from('orders').select(ORDER_SELECT).eq('id', order.id).single();
    return ok(res, { order: full || order }, 201);
  } catch (err) { next(err); }
};

/** GET /api/orders/my - current user's orders */
exports.listMine = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders').select(ORDER_SELECT).eq('user_id', req.user.id)
      .order('created_at', { ascending: false }).limit(100);
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { orders });
  } catch (err) { next(err); }
};

/** GET /api/orders/:id - owner, assigned rider or admin */
exports.get = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders').select(ORDER_SELECT).eq('id', req.params.id).maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!order) throw new ApiError('Order not found', 404, 'NOT_FOUND');

    const u = req.user;
    if (u.role !== 'admin' && order.user_id !== u.id && order.rider_id !== u.id) {
      throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    const { data: events } = await supabase
      .from('order_events').select('id, status, note, created_at').eq('order_id', order.id)
      .order('created_at', { ascending: true });
    return ok(res, { order: { ...order, events: events || [] } });
  } catch (err) { next(err); }
};

/** POST /api/orders/:id/cancel - customer cancels own pending order */
exports.cancelMine = async (req, res, next) => {
  try {
    const { data: order } = await supabase.from('orders').select('id, user_id, status').eq('id', req.params.id).maybeSingle();
    if (!order) throw new ApiError('Order not found', 404, 'NOT_FOUND');
    if (order.user_id !== req.user.id) throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN');
    if (order.status !== 'pending') throw new ApiError('Only pending orders can be cancelled', 422, 'INVALID_STATUS');

    const { data: updated, error } = await supabase
      .from('orders').update({ status: 'cancelled' }).eq('id', order.id).select('*').single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    await logEvent(order.id, 'cancelled', req.user.id, req.body.reason || 'Cancelled by customer');
    return ok(res, { order: updated });
  } catch (err) { next(err); }
};

/* ---------------- Admin ---------------- */

/** GET /api/admin/orders - filterable list */
exports.adminList = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 25);
    const from = (page - 1) * limit;

    let q = supabase.from('orders').select(ORDER_SELECT, { count: 'exact' });
    if (req.query.status) q = q.eq('status', req.query.status);
    if (req.query.riderId) q = q.eq('rider_id', req.query.riderId);
    if (req.query.search) q = q.ilike('order_number', `%${req.query.search}%`);
    q = q.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data: orders, count, error } = await q;
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { orders, pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) } });
  } catch (err) { next(err); }
};

/** PATCH /api/admin/orders/:id/status */
exports.adminSetStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!STATUSES.includes(status)) throw new ApiError('Invalid status', 422, 'INVALID_STATUS');
    const patch = { status };
    if (status === 'delivered') patch.delivered_at = new Date().toISOString();
    const { data: order, error } = await supabase
      .from('orders').update(patch).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!order) throw new ApiError('Order not found', 404, 'NOT_FOUND');
    await logEvent(order.id, status, req.user.id, note || 'Updated by admin');
    return ok(res, { order });
  } catch (err) { next(err); }
};

/** PATCH /api/admin/orders/:id/assign - assign/unassign a rider */
exports.adminAssignRider = async (req, res, next) => {
  try {
    const { riderId } = req.body;
    if (riderId) {
      const { data: rider } = await supabase.from('users').select('id, role').eq('id', riderId).maybeSingle();
      if (!rider || rider.role !== 'rider') throw new ApiError('Rider not found', 422, 'INVALID_RIDER');
    }
    const { data: order, error } = await supabase
      .from('orders').update({ rider_id: riderId || null }).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!order) throw new ApiError('Order not found', 404, 'NOT_FOUND');
    await logEvent(order.id, order.status, req.user.id, riderId ? 'Rider assigned' : 'Rider unassigned');
    return ok(res, { order });
  } catch (err) { next(err); }
};

/* ---------------- Rider ---------------- */

/** GET /api/rider/orders - active assignments (?history=true for delivered/cancelled) */
exports.riderList = async (req, res, next) => {
  try {
    const history = req.query.history === 'true';
    let q = supabase.from('orders').select(ORDER_SELECT).eq('rider_id', req.user.id);
    q = history
      ? q.in('status', ['delivered', 'cancelled']).order('created_at', { ascending: false }).limit(100)
      : q.in('status', ['preparing', 'dispatched', 'arriving']).order('created_at', { ascending: true });
    const { data: orders, error } = await q;
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { orders });
  } catch (err) { next(err); }
};

/** PATCH /api/rider/orders/:id/status - dispatched -> arriving -> delivered */
exports.riderSetStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { data: order } = await supabase
      .from('orders').select('id, rider_id, status').eq('id', req.params.id).maybeSingle();
    if (!order) throw new ApiError('Order not found', 404, 'NOT_FOUND');
    if (order.rider_id !== req.user.id) throw new ApiError('Order is not assigned to you', 403, 'FORBIDDEN');

    const allowed = RIDER_FLOW[order.status] || [];
    if (!allowed.includes(status)) {
      throw new ApiError(`Cannot change status from '${order.status}' to '${status}'`, 422, 'INVALID_TRANSITION');
    }

    const patch = { status };
    if (status === 'delivered') patch.delivered_at = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from('orders').update(patch).eq('id', order.id).select('*').single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    await logEvent(order.id, status, req.user.id, 'Updated by rider');
    return ok(res, { order: updated });
  } catch (err) { next(err); }
};
