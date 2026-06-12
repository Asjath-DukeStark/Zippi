const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const PUBLIC_USER = 'id, phone, name, email, role, is_active, avatar_url, created_at';

/** GET /api/admin/users — list with role/search filters */
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 25);
    const from = (page - 1) * limit;

    let q = supabase.from('users').select(PUBLIC_USER, { count: 'exact' });
    if (req.query.role) q = q.eq('role', req.query.role);
    if (req.query.search) q = q.or(`name.ilike.%${req.query.search}%,phone.ilike.%${req.query.search}%`);
    q = q.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data: users, count, error } = await q;
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { users, pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) } });
  } catch (err) { next(err); }
};

/** GET /api/admin/users/:id — profile + order summary */
exports.get = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase.from('users').select(PUBLIC_USER).eq('id', req.params.id).maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!user) throw new ApiError('User not found', 404, 'NOT_FOUND');

    const { data: orders } = await supabase
      .from('orders').select('id, order_number, status, total, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    return ok(res, { user, orders: orders || [] });
  } catch (err) { next(err); }
};

/** POST /api/admin/users — create user (any role; used to onboard riders/admins) */
exports.create = async (req, res, next) => {
  try {
    const { phone, name, email, role, password } = req.body;
    const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
    if (existing) throw new ApiError('An account with this phone number already exists', 409, 'PHONE_EXISTS');

    const { data: user, error } = await supabase
      .from('users')
      .insert({ phone, name, email: email || null, role, password_hash: await bcrypt.hash(password, 10) })
      .select(PUBLIC_USER)
      .single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    if (role === 'rider') {
      await supabase.from('rider_profiles').upsert({ user_id: user.id, is_online: false });
    }
    return ok(res, { user }, 201);
  } catch (err) { next(err); }
};

/** PATCH /api/admin/users/:id — update profile / role / active flag / reset password */
exports.update = async (req, res, next) => {
  try {
    const patch = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.email !== undefined) patch.email = req.body.email || null;
    if (req.body.role !== undefined) patch.role = req.body.role;
    if (req.body.isActive !== undefined) patch.is_active = !!req.body.isActive;
    if (req.body.password) patch.password_hash = await bcrypt.hash(req.body.password, 10);

    const { data: user, error } = await supabase
      .from('users').update(patch).eq('id', req.params.id).select(PUBLIC_USER).maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!user) throw new ApiError('User not found', 404, 'NOT_FOUND');

    if (patch.role === 'rider') await supabase.from('rider_profiles').upsert({ user_id: user.id });
    return ok(res, { user });
  } catch (err) { next(err); }
};

/** DELETE /api/admin/users/:id — disable account (soft) */
exports.remove = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) throw new ApiError('You cannot disable your own account', 422, 'SELF_DELETE');
    const { error } = await supabase.from('users').update({ is_active: false }).eq('id', req.params.id);
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { deleted: true });
  } catch (err) { next(err); }
};
