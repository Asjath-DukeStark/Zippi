const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

/** GET /api/admin/analytics/summary - dashboard headline stats */
exports.summary = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [orders, customers, riders, products, todayOrders] = await Promise.all([
      supabase.from('orders').select('id, total, status', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'rider'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('id, total, status').gte('created_at', today.toISOString())
    ]);
    if (orders.error) throw new ApiError(orders.error.message, 500, 'DB_ERROR');

    const all = orders.data || [];
    const delivered = all.filter((o) => o.status === 'delivered');
    const tAll = todayOrders.data || [];

    return ok(res, {
      totalOrders: orders.count || 0,
      totalRevenue: delivered.reduce((s, o) => s + Number(o.total || 0), 0),
      pendingOrders: all.filter((o) => o.status === 'pending').length,
      activeOrders: all.filter((o) => ['preparing', 'dispatched', 'arriving'].includes(o.status)).length,
      todayOrders: tAll.length,
      todayRevenue: tAll.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.total || 0), 0),
      totalCustomers: customers.count || 0,
      totalRiders: riders.count || 0,
      activeProducts: products.count || 0,
      statusBreakdown: all.reduce((m, o) => ((m[o.status] = (m[o.status] || 0) + 1), m), {})
    });
  } catch (err) { next(err); }
};

/** GET /api/admin/analytics/orders-by-day?days=14 - time series for charts */
exports.ordersByDay = async (req, res, next) => {
  try {
    const days = Math.min(90, Number(req.query.days) || 14);
    const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - (days - 1));

    const { data, error } = await supabase
      .from('orders').select('created_at, total, status').gte('created_at', since.toISOString());
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    const series = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since); d.setDate(since.getDate() + i);
      series[d.toISOString().slice(0, 10)] = { date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 };
    }
    for (const o of data || []) {
      const key = o.created_at.slice(0, 10);
      if (series[key]) {
        series[key].orders += 1;
        if (o.status === 'delivered') series[key].revenue += Number(o.total || 0);
      }
    }
    return ok(res, { series: Object.values(series) });
  } catch (err) { next(err); }
};

/** GET /api/admin/analytics/top-products?limit=10 */
exports.topProducts = async (req, res, next) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity, price, product:products ( id, name, unit, image_url )');
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    const agg = {};
    for (const row of data || []) {
      if (!row.product) continue;
      const a = (agg[row.product_id] ||= { product: row.product, unitsSold: 0, revenue: 0 });
      a.unitsSold += row.quantity;
      a.revenue += row.quantity * Number(row.price || 0);
    }
    const top = Object.values(agg).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, limit);
    return ok(res, { products: top });
  } catch (err) { next(err); }
};

/**
 * GET /api/admin/analytics/report?days=30 - deep-dive report:
 * payment split, orders by hour, revenue by category, new customers, rider leaderboard.
 */
exports.report = async (req, res, next) => {
  try {
    const days = Math.min(90, Number(req.query.days) || 30);
    const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - (days - 1));
    const sinceIso = since.toISOString();

    const [ordersQ, itemsQ, customersQ, ridersQ] = await Promise.all([
      supabase.from('orders')
        .select('id, total, status, payment_method, rider_id, created_at, delivered_at')
        .gte('created_at', sinceIso),
      supabase.from('order_items')
        .select('quantity, price, product:products ( category_slug ), order:orders ( created_at, status )'),
      supabase.from('users').select('id, created_at').eq('role', 'customer').gte('created_at', sinceIso),
      supabase.from('users').select('id, name').eq('role', 'rider')
    ]);
    if (ordersQ.error) throw new ApiError(ordersQ.error.message, 500, 'DB_ERROR');

    const orders = ordersQ.data || [];
    const delivered = orders.filter((o) => o.status === 'delivered');
    const revenue = delivered.reduce((s, o) => s + Number(o.total || 0), 0);

    // Payment method split
    const paymentSplit = { COD: { orders: 0, value: 0 }, CARD: { orders: 0, value: 0 } };
    for (const o of orders) {
      const k = o.payment_method === 'CARD' ? 'CARD' : 'COD';
      paymentSplit[k].orders += 1;
      paymentSplit[k].value += Number(o.total || 0);
    }

    // Orders by hour of day
    const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0 }));
    for (const o of orders) byHour[new Date(o.created_at).getHours()].orders += 1;

    // Revenue by category (items of non-cancelled orders inside the window)
    const byCategory = {};
    for (const row of itemsQ.data || []) {
      const created = row.order?.created_at;
      if (!created || created < sinceIso) continue;
      if (row.order?.status === 'cancelled') continue;
      const slug = row.product?.category_slug || 'other';
      byCategory[slug] = (byCategory[slug] || 0) + row.quantity * Number(row.price || 0);
    }

    // Rider leaderboard (deliveries inside the window)
    const riderNames = Object.fromEntries((ridersQ.data || []).map((r) => [r.id, r.name]));
    const riderAgg = {};
    for (const o of delivered) {
      if (!o.rider_id) continue;
      const a = (riderAgg[o.rider_id] ||= { riderId: o.rider_id, name: riderNames[o.rider_id] || 'Unknown', deliveries: 0, value: 0 });
      a.deliveries += 1;
      a.value += Number(o.total || 0);
    }

    return ok(res, {
      window: { days, since: sinceIso },
      totals: {
        orders: orders.length,
        revenue,
        delivered: delivered.length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
        newCustomers: (customersQ.data || []).length,
        avgOrderValue: delivered.length ? revenue / delivered.length : 0
      },
      paymentSplit,
      byHour,
      byCategory: Object.entries(byCategory)
        .map(([category, rev]) => ({ category, revenue: Math.round(rev * 100) / 100 }))
        .sort((a, b) => b.revenue - a.revenue),
      riders: Object.values(riderAgg).sort((a, b) => b.deliveries - a.deliveries)
    });
  } catch (err) { next(err); }
};
