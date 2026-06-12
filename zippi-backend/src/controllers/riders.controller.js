const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

/** GET /api/admin/riders — riders with profile + live workload */
exports.adminList = async (req, res, next) => {
  try {
    const { data: riders, error } = await supabase
      .from('users')
      .select('id, phone, name, email, is_active, avatar_url, created_at, profile:rider_profiles ( latitude, longitude, is_online, vehicle_type, updated_at )')
      .eq('role', 'rider')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    const ids = riders.map((r) => r.id);
    let active = [], delivered = [];
    if (ids.length) {
      const a = await supabase.from('orders').select('rider_id').in('rider_id', ids).in('status', ['preparing', 'dispatched', 'arriving']);
      const d = await supabase.from('orders').select('rider_id').in('rider_id', ids).eq('status', 'delivered');
      active = a.data || []; delivered = d.data || [];
    }
    const countBy = (rows) => rows.reduce((m, r) => ((m[r.rider_id] = (m[r.rider_id] || 0) + 1), m), {});
    const activeBy = countBy(active), deliveredBy = countBy(delivered);

    return ok(res, {
      riders: riders.map((r) => ({
        ...r,
        active_orders: activeBy[r.id] || 0,
        total_deliveries: deliveredBy[r.id] || 0
      }))
    });
  } catch (err) { next(err); }
};

/** PATCH /api/rider/status — online/offline toggle + GPS ping */
exports.updateStatus = async (req, res, next) => {
  try {
    const patch = { user_id: req.user.id, updated_at: new Date().toISOString() };
    if (req.body.isOnline !== undefined) patch.is_online = !!req.body.isOnline;
    if (req.body.latitude !== undefined) patch.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) patch.longitude = req.body.longitude;
    if (req.body.vehicleType !== undefined) patch.vehicle_type = req.body.vehicleType;

    const { data: profile, error } = await supabase
      .from('rider_profiles').upsert(patch).select('*').single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { profile });
  } catch (err) { next(err); }
};

/** GET /api/rider/me — profile + today/all-time stats */
exports.me = async (req, res, next) => {
  try {
    const { data: profile } = await supabase.from('rider_profiles').select('*').eq('user_id', req.user.id).maybeSingle();

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { data: deliveredToday } = await supabase
      .from('orders').select('id, total').eq('rider_id', req.user.id)
      .eq('status', 'delivered').gte('delivered_at', today.toISOString());
    const { count: totalDeliveries } = await supabase
      .from('orders').select('id', { count: 'exact', head: true })
      .eq('rider_id', req.user.id).eq('status', 'delivered');
    const { count: activeCount } = await supabase
      .from('orders').select('id', { count: 'exact', head: true })
      .eq('rider_id', req.user.id).in('status', ['preparing', 'dispatched', 'arriving']);

    return ok(res, {
      user: req.user,
      profile: profile || { is_online: false },
      stats: {
        deliveredToday: (deliveredToday || []).length,
        earnedToday: (deliveredToday || []).reduce((s, o) => s + Number(o.total || 0), 0),
        totalDeliveries: totalDeliveries || 0,
        activeOrders: activeCount || 0
      }
    });
  } catch (err) { next(err); }
};
