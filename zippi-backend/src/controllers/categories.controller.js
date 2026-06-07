const db = require('../utils/dbHelper');

// Cache storage
let categoriesCache = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getCategories = async (req, res, next) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (categoriesCache && (now - cacheTime < CACHE_TTL)) {
      return res.status(200).json({
        success: true,
        data: categoriesCache,
        message: 'Categories fetched (cached)'
      });
    }

    const categories = await db.categories.findAll();
    
    // Update cache
    categoriesCache = categories;
    cacheTime = now;

    return res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories fetched'
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Parse query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'newest'; // newest, price_asc, price_desc
    
    const offset = (page - 1) * limit;

    // Check if category slug exists
    const category = await db.categories.findBySlug(slug);
    if (!category && slug !== 'all') {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'NOT_FOUND'
      });
    }

    const { products, total } = await db.products.findAll({
      category: slug,
      sort,
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Category products fetched'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryProducts
};
