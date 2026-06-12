const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const mapBody = (b) => {
  const m = {};
  const map = {
    name: 'name', slug: 'slug', icon: 'icon', imageUrl: 'image_url',
    parentSlug: 'parent_slug', sortOrder: 'sort_order', isActive: 'is_active'
  };
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) m[col] = b[k];
  return m;
};

/** GET /api/categories — public; response: { success, data: [...] } (web-app contract) */
exports.list = async (req, res, next) => {
  try {
    let q = supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name');
    if (!(req.user?.role === 'admin' && req.query.includeInactive === 'true')) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, data);
  } catch (err) { next(err); }
};

/** POST /api/admin/categories */
exports.create = async (req, res, next) => {
  try {
    const body = mapBody(req.body);
    if (!body.slug) body.slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: category, error } = await supabase.from('categories').insert(body).select('*').single();
    if (error) throw new ApiError(error.code === '23505' ? 'A category with this slug already exists' : error.message, error.code === '23505' ? 409 : 500, 'DB_ERROR');
    return ok(res, { category }, 201);
  } catch (err) { next(err); }
};

/** PATCH /api/admin/categories/:id */
exports.update = async (req, res, next) => {
  try {
    const { data: category, error } = await supabase
      .from('categories').update(mapBody(req.body)).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!category) throw new ApiError('Category not found', 404, 'NOT_FOUND');
    return ok(res, { category });
  } catch (err) { next(err); }
};

/** DELETE /api/admin/categories/:id — soft delete by default */
exports.remove = async (req, res, next) => {
  try {
    if (req.query.hard === 'true') {
      const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
      if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    } else {
      const { error } = await supabase.from('categories').update({ is_active: false }).eq('id', req.params.id);
      if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    }
    return ok(res, { deleted: true });
  } catch (err) { next(err); }
};
