const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { ok, fail, ApiError } = require('../utils/response');
const { sign } = require('../utils/jwt');

const PUBLIC_USER = 'id, phone, name, email, role, is_active, avatar_url, created_at';

/** POST /api/auth/register — customer self-registration */
exports.register = async (req, res, next) => {
  try {
    const { phone, name, email, password } = req.body;

    const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
    if (existing) throw new ApiError('An account with this phone number already exists', 409, 'PHONE_EXISTS');

    const password_hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ phone, name, email: email || null, role: 'customer', password_hash })
      .select(PUBLIC_USER)
      .single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    return ok(res, { user, token: sign(user) }, 201);
  } catch (err) { next(err); }
};

/** POST /api/auth/login — all roles */
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select(`${PUBLIC_USER}, password_hash`)
      .eq('phone', phone)
      .maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return fail(res, 'Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
    }
    if (user.is_active === false) return fail(res, 'Account is disabled', 403, 'ACCOUNT_DISABLED');

    delete user.password_hash;
    return ok(res, { user, token: sign(user) });
  } catch (err) { next(err); }
};

/** GET /api/auth/me */
exports.me = async (req, res) => ok(res, { user: req.user });

/** PATCH /api/auth/me — update own profile */
exports.updateMe = async (req, res, next) => {
  try {
    const patch = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.email !== undefined) patch.email = req.body.email || null;
    if (req.body.avatarUrl !== undefined) patch.avatar_url = req.body.avatarUrl || null;
    if (req.body.password) patch.password_hash = await bcrypt.hash(req.body.password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', req.user.id)
      .select(PUBLIC_USER)
      .single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { user });
  } catch (err) { next(err); }
};
