const db = require('../utils/dbHelper');

const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { search, category, sort } = req.query;

    const { products, total } = await db.products.findAll({
      search,
      category,
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
      message: 'Products fetched'
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    // Return all popular products
    const { products } = await db.products.findAll({
      popular: true,
      limit: 20
    });

    return res.status(200).json({
      success: true,
      data: products,
      message: 'Featured products fetched'
    });
  } catch (error) {
    next(error);
  }
};

const getFlashDeals = async (req, res, next) => {
  try {
    // Return all flash deals
    const { products } = await db.products.findAll({
      isFlashDeal: true,
      limit: 20
    });

    return res.status(200).json({
      success: true,
      data: products,
      message: 'Flash deals fetched'
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await db.products.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Product details fetched'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getFlashDeals,
  getProductById
};
