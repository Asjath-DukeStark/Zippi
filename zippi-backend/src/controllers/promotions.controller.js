const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const mapBody = (b) => {
  const m = {};
  const map = {
    code: 'code', description: 'description', type: 'type', value: 'value',
    minOrder: 'min_order', maxDiscount: 'max_discount', startsAt: 'starts_at',
    expiresAt: 'expires_at', usageLimit: 'usage_limit', isActive: 'is_active',
    scope: 'scope', targetCategorySlug: 'target_category_slug',
    targetProductId: 'target_product_id', targetPaymentMethod: 'target_payment_method',
    firstOrderOnly: 'first_order_only', startHour: 'start_hour', endHour: 'end_hour'
  };
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) m[col] = b[k];
  if (m.code) m.code = String(m.code).trim().toUpperCase();
  return m;
};

/** 
 * Shared validation: returns { valid, reason, discount, isFreeDelivery } 
 * Params:
 *  - promo: promotion object from DB
 *  - subtotal: order subtotal
 *  - items: array of { product_id, price, quantity, category_slug }
 *  - userId: ID of the user ordering (for first-order check)
 *  - paymentMethod: 'COD' or 'CARD'
 */
const evaluate = async (promo, { subtotal, items = [], userId = null, paymentMethod = null } = {}) => {
  if (!promo) return { valid: false, reason: 'Promo code not found' };
  if (promo.is_active === false) return { valid: false, reason: 'This promo code is no longer active' };
  
  const now = new Date();
  if (promo.starts_at && new Date(promo.starts_at) > now) return { valid: false, reason: 'This promo code is not active yet' };
  if (promo.expires_at && new Date(promo.expires_at) < now) return { valid: false, reason: 'This promo code has expired' };
  if (promo.usage_limit && promo.used_count >= promo.usage_limit) return { valid: false, reason: 'This promo code has reached its usage limit' };
  
  // 1. First Order Only Check
  if (promo.first_order_only && userId) {
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'cancelled');
    if (error) throw error;
    if (count && count > 0) return { valid: false, reason: 'This promo code is only valid for your first order' };
  }

  // 2. Daily Time-Window (Happy Hour) Check
  if (promo.start_hour !== null && promo.start_hour !== undefined && promo.end_hour !== null && promo.end_hour !== undefined) {
    const currentHour = now.getHours();
    if (currentHour < promo.start_hour || currentHour >= promo.end_hour) {
      return { valid: false, reason: `This promo code is only active between ${promo.start_hour}:00 and ${promo.end_hour}:00` };
    }
  }

  // 3. Payment Method Check
  if (promo.target_payment_method && paymentMethod && paymentMethod !== promo.target_payment_method) {
    return { valid: false, reason: `This promo code is only valid for ${promo.target_payment_method} payments` };
  }

  // 4. Minimum Order Check
  if (promo.min_order && subtotal < Number(promo.min_order)) {
    return { valid: false, reason: `Minimum order of Rs. ${promo.min_order} required for this code` };
  }

  // Calculate scope-based discount amount
  let eligibleAmount = subtotal;

  if (promo.scope === 'category' && promo.target_category_slug) {
    const eligibleItems = items.filter(item => item.category_slug === promo.target_category_slug);
    eligibleAmount = eligibleItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    if (eligibleAmount === 0) {
      return { valid: false, reason: `This promo code only applies to products in category: ${promo.target_category_slug}` };
    }
  } else if (promo.scope === 'product' && promo.target_product_id) {
    const eligibleItems = items.filter(item => item.product_id === promo.target_product_id);
    eligibleAmount = eligibleItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    if (eligibleAmount === 0) {
      return { valid: false, reason: 'This promo code does not apply to any items in your cart' };
    }
  }

  // 5. Resolve final discount
  if (promo.scope === 'delivery') {
    return { valid: true, discount: 0, isFreeDelivery: true };
  } else {
    let discount = promo.type === 'percent'
      ? (eligibleAmount * Number(promo.value)) / 100
      : Number(promo.value);

    if (promo.max_discount) discount = Math.min(discount, Number(promo.max_discount));
    discount = Math.min(discount, subtotal);
    return { valid: true, discount: Math.round(discount * 100) / 100, isFreeDelivery: false };
  }
};
exports.evaluate = evaluate;

/** GET /api/admin/promotions */
exports.list = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { promotions: data });
  } catch (err) { next(err); }
};

/** POST /api/admin/promotions */
exports.create = async (req, res, next) => {
  try {
    const body = mapBody(req.body);
    const { data: promotion, error } = await supabase.from('promotions').insert(body).select('*').single();
    if (error) {
      throw new ApiError(
        error.code === '23505' ? 'A promotion with this code already exists' : error.message,
        error.code === '23505' ? 409 : 500, 'DB_ERROR'
      );
    }
    return ok(res, { promotion }, 201);
  } catch (err) { next(err); }
};

/** PATCH /api/admin/promotions/:id */
exports.update = async (req, res, next) => {
  try {
    const { data: promotion, error } = await supabase
      .from('promotions').update(mapBody(req.body)).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!promotion) throw new ApiError('Promotion not found', 404, 'NOT_FOUND');
    return ok(res, { promotion });
  } catch (err) { next(err); }
};

/** DELETE /api/admin/promotions/:id */
exports.remove = async (req, res, next) => {
  try {
    const { error } = await supabase.from('promotions').delete().eq('id', req.params.id);
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { deleted: true });
  } catch (err) { next(err); }
};

/** POST /api/promotions/validate — { code, subtotal, items, paymentMethod, userId } (customer-facing) */
exports.validateCode = async (req, res, next) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    const subtotal = Number(req.body.subtotal) || 0;
    const items = req.body.items || [];
    const paymentMethod = req.body.paymentMethod || null;
    const userId = req.body.userId || (req.user ? req.user.id : null);

    if (!code) throw new ApiError('code is required', 422, 'VALIDATION_ERROR');

    const { data: promo, error } = await supabase.from('promotions').select('*').eq('code', code).maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    const result = await evaluate(promo, { subtotal, items, userId, paymentMethod });
    if (!result.valid) return ok(res, { valid: false, reason: result.reason });
    return ok(res, { 
      valid: true, 
      discount: result.discount, 
      promotion: { 
        code: promo.code, 
        type: promo.type, 
        value: promo.value,
        isFreeDelivery: result.isFreeDelivery
      } 
    });
  } catch (err) { next(err); }
};
