const { verify } = require('../utils/jwt');
const { fail } = require('../utils/response');
const supabase = require('../config/supabase');

/** Attach req.user from a Bearer token. */
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Authentication required', 401, 'NO_TOKEN');

    const payload = verify(token);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, name, email, role, is_active, avatar_url, created_at')
      .eq('id', payload.sub)
      .single();

    if (error || !user) return fail(res, 'Invalid token: user not found', 401, 'INVALID_TOKEN');
    if (user.is_active === false) return fail(res, 'Account is disabled', 403, 'ACCOUNT_DISABLED');

    req.user = user;
    next();
  } catch {
    return fail(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};

/** Restrict route to one or more roles. Use after requireAuth. */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, 'Insufficient permissions', 403, 'FORBIDDEN');
  }
  next();
};

module.exports = { requireAuth, requireRole };
