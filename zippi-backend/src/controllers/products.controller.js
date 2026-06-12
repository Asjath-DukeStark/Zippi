const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const mapBody = (b) => {
  const m = {};
  const map = {
    name: 'name', description: 'description', categorySlug: 'category_slug', price: 'price',
    originalPrice: 'original_price', discountPercent: 'discount_percent', unit: 'unit',
    imageUrl: 'image_url', popular: 'popular', isFlashDeal: 'is_flash_deal', stock: 'stock',
    rating: 'rating', reviewsCount: 'reviews_count', isActive: 'is_active', variants: 'variants'
  };
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) m[col] = b[k];
  return m;
};

/**
 * GET /api/products — public list (web/mobile).
 * Query: category, search, popular, flash, includeInactive (admin), page, limit, sort
 * Response shape kept compatible with the live Zippi web app: { success, data: { products, pagination } }
 */
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const from = (page - 1) * limit;

    let q = supabase.from('products').select('*', { count: 'exact' });

    const isAdmin = req.user?.role === 'admin';
    if (!(isAdmin && req.query.includeInactive === 'true')) q = q.eq('is_active', true);
    if (req.query.category) q = q.eq('category_slug', req.query.category);
    if (req.query.popular === 'true') q = q.eq('popular', true);
    if (req.query.flash === 'true') q = q.eq('is_flash_deal', true);
    if (req.query.search) q = q.ilike('name', `%${req.query.search}%`);

    const sort = req.query.sort || 'created_at';
    const asc = req.query.order === 'asc';
    q = q.order(sort, { ascending: asc }).range(from, from + limit - 1);

    const { data: products, count, error } = await q;
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    return ok(res, {
      products,
      pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) }
    });
  } catch (err) { next(err); }
};

/** GET /api/products/:id */
exports.get = async (req, res, next) => {
  try {
    const { data: product, error } = await supabase.from('products').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!product) throw new ApiError('Product not found', 404, 'NOT_FOUND');
    return ok(res, { product });
  } catch (err) { next(err); }
};

/** POST /api/admin/products */
exports.create = async (req, res, next) => {
  try {
    const { data: product, error } = await supabase.from('products').insert(mapBody(req.body)).select('*').single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { product }, 201);
  } catch (err) { next(err); }
};

/** PATCH /api/admin/products/:id */
exports.update = async (req, res, next) => {
  try {
    const { data: product, error } = await supabase
      .from('products').update(mapBody(req.body)).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    if (!product) throw new ApiError('Product not found', 404, 'NOT_FOUND');
    return ok(res, { product });
  } catch (err) { next(err); }
};

/** DELETE /api/admin/products/:id — soft delete (is_active=false); ?hard=true to remove */
exports.remove = async (req, res, next) => {
  try {
    if (req.query.hard === 'true') {
      const { error } = await supabase.from('products').delete().eq('id', req.params.id);
      if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    } else {
      const { error } = await supabase.from('products').update({ is_active: false }).eq('id', req.params.id);
      if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    }
    return ok(res, { deleted: true });
  } catch (err) { next(err); }
};

/** POST /api/admin/products/import */
exports.importExcel = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError('No file uploaded', 400, 'BAD_REQUEST');
    
    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      throw new ApiError('Excel file is empty', 400, 'EMPTY_FILE');
    }

    const productsToInsert = data.map(row => {
      const name = row.name || row.Name || '';
      const description = row.description || row.Description || null;
      const categorySlug = row.category_slug || row.category || row.Category || '';
      const price = Number(row.price || row.Price || 0);
      const originalPrice = row.original_price || row.OriginalPrice || null;
      const discountPercent = row.discount_percent || null;
      const unit = row.unit || row.Unit || '1 piece';
      const popular = row.popular === true || row.popular === 'TRUE' || row.popular === 'true';
      const isFlashDeal = row.is_flash_deal === 'true' || row.is_flash_deal === 'TRUE' || row.is_flash_deal === true;
      const stock = row.stock ? parseInt(row.stock, 10) : 0;
      const isActive = row.is_active !== false && row.is_active !== 'FALSE' && row.is_active !== 'false';

      return {
        name,
        description,
        category_slug: categorySlug,
        price,
        original_price: originalPrice ? Number(originalPrice) : null,
        discount_percent: discountPercent ? Number(discountPercent) : null,
        unit,
        popular,
        is_flash_deal: isFlashDeal,
        stock,
        is_active: isActive
      };
    }).filter(p => p.name);

    if (productsToInsert.length === 0) {
      throw new ApiError('No valid products found in file', 400, 'INVALID_DATA');
    }

    const { data: inserted, error } = await supabase.from('products').insert(productsToInsert).select('*');
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');

    return ok(res, { importedCount: inserted ? inserted.length : productsToInsert.length });
  } catch (err) { next(err); }
};
