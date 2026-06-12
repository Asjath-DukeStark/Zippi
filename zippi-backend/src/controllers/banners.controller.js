const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const mapBody = (b) => {
  const m = {};
  const map = { title: 'title', imageUrl: 'image_url', linkUrl: 'link_url', sortOrder: 'sort_order', isActive: 'is_active' };
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) m[col] = b[k];
  return m;
};

/** GET /api/banners — public; response: { success, data: [...] } (web-app contract) */
exports.list = async (req, res, next) => {
  try {
    let q = supabase.from('banners').select('*').order('sort_order', { ascending: true });
    if (!(req.user?.role === 'admin' && req.query.includeInactive === 'true')) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, data);
  } catch (err) { next(err); }
};

/** POST /api/admin/banners */
exports.create = async (req, res, next) => {
  try {
    const { data: banner, error } = await supabase.from('banners').insert(mapBody(req.body)).select('*').single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { banner }, 201);
  } catch (err) { next(err); }
};

/** PATCH /api/admin/banners/:id */
exports.update = async (req, res, next) => {
  try {
    const { data: banner, error } = await supabase
      .from('banners').update(mapBody(req.body)).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!banner) throw new ApiError('Banner not found', 404, 'NOT_FOUND');
    return ok(res, { banner });
  } catch (err) { next(err); }
};

/** DELETE /api/admin/banners/:id — hard delete (banners are disposable) */
exports.remove = async (req, res, next) => {
  try {
    const { error } = await supabase.from('banners').delete().eq('id', req.params.id);
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { deleted: true });
  } catch (err) { next(err); }
};
