const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const mapBody = (b) => {
  const m = {};
  const map = {
    code: 'code', description: 'description', type: 'type', value: 'value',
    minOrder: 'min_order', maxDiscount: 'max_discount', startsAt: 'starts_at',
    expiresAt: 'expires_at', usageLimit: 'usage_limit', isActive: 'is_active'
  };
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) m[col] = b[k];
  if (m.code) m.code = String(m.code).trim().toUpperCase();
  return m;
};

/** Shared validation: returns { valid, reason, discount } for a promo + subtotal. */
const evaluate = (promo, subtotal) => {
  if (!promo) return { valid: false, reason: 'Promo code not found' };
  if (promo.is_active === false) return { valid: false, reason: 'This promo code is no longer active' };
  const now = new Date();
  if (promo.starts_at && new Date(promo.starts_at) > now) return { valid: false, reason: 'This promo code is not active yet' };
  if (promo.expires_at && new Date(promo.expires_at) < now) return { valid: false, reason: 'This promo code has expired' };
  if (promo.usage_limit && promo.used_count >= promo.usage_limit) return { valid: false, reason: 'This promo code has reached its usage limit' };
  if (promo.min_order && subtotal < Number(promo.min_order)) {
    return { valid: false, reason: `Minimum order of ${promo.min_order} required for this code` };
  }
  let discount = promo.type === 'percent'
    ? (subtotal * Number(promo.value)) / 100
    : Number(promo.value);
  if (promo.max_discount) discount = Math.min(discount, Number(promo.max_discount));
  discount = Math.min(discount, subtotal);
  return { valid: true, discount: Math.round(discount * 100) / 100 };
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

/** POST /api/promotions/validate — { code, subtotal } (customer-facing) */
exports.validateCode = async (req, res, next) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    const subtotal = Number(req.body.subtotal) || 0;
    if (!code) throw new ApiError('code is required', 422, 'VALIDATION_ERROR');

    const { data: promo, error } = await supabase.from('promotions').select('*').eq('code', code).maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    const result = evaluate(promo, subtotal);
    if (!result.valid) return ok(res, { valid: false, reason: result.reason });
    return ok(res, { valid: true, discount: result.discount, promotion: { code: promo.code, type: promo.type, value: promo.value } });
  } catch (err) { next(err); }
};
