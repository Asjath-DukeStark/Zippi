const db = require('../utils/dbHelper');
const { uploadToSupabase } = require('../config/upload');

// --- PRODUCTS CRUD ---
const createProduct = async (req, res, next) => {
  try {
    let imageUrl = req.body.image_url || req.body.imageUrl;
    
    // Check if image file was uploaded
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const { name, description, category_slug, price, original_price, discount_percent, unit, popular, is_flash_deal, stock } = req.body;

    if (!name || !price || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and unit are required fields',
        error: 'VALIDATION_ERROR'
      });
    }

    const newProduct = await db.products.create({
      name,
      description,
      category_slug,
      price,
      original_price,
      discount_percent,
      unit,
      image_url: imageUrl,
      popular: popular === 'true' || popular === true,
      is_flash_deal: is_flash_deal === 'true' || is_flash_deal === true,
      stock: stock !== undefined ? stock : 10
    });

    return res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let imageUrl = req.body.image_url || req.body.imageUrl;
    
    // Check if new image was uploaded
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const updates = { ...req.body };
    if (imageUrl) {
      updates.image_url = imageUrl;
    }
    
    // Clean up string-boolean mappings from form-data if present
    if (updates.popular !== undefined) updates.popular = updates.popular === 'true' || updates.popular === true;
    if (updates.is_flash_deal !== undefined) updates.is_flash_deal = updates.is_flash_deal === 'true' || updates.is_flash_deal === true;

    const updated = await db.products.update(id, updates);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await db.products.delete(id);

    return res.status(200).json({
      success: true,
      data: deleted,
      message: 'Product deleted successfully (soft delete)'
    });
  } catch (error) {
    next(error);
  }
};


// --- CATEGORIES CRUD ---
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, icon, is_active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
        error: 'VALIDATION_ERROR'
      });
    }

    const newCategory = await db.categories.create({
      name,
      slug,
      icon,
      is_active: is_active === undefined ? true : (is_active === 'true' || is_active === true)
    });

    return res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.is_active !== undefined) {
      updates.is_active = updates.is_active === 'true' || updates.is_active === true;
    }

    const updated = await db.categories.update(id, updates);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await db.categories.delete(id);

    return res.status(200).json({
      success: true,
      data: deleted,
      message: 'Category deleted successfully (soft delete)'
    });
  } catch (error) {
    next(error);
  }
};


// --- BANNERS CRUD ---
const createBanner = async (req, res, next) => {
  try {
    let imageUrl = req.body.image_url || req.body.imageUrl;
    
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const { title, link_url, sort_order, is_active } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Banner title and image are required',
        error: 'VALIDATION_ERROR'
      });
    }

    const newBanner = await db.banners.create({
      title,
      image_url: imageUrl,
      link_url,
      sort_order: sort_order ? parseInt(sort_order) : 0,
      is_active: is_active === undefined ? true : (is_active === 'true' || is_active === true)
    });

    return res.status(201).json({
      success: true,
      data: newBanner,
      message: 'Banner created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    let imageUrl = req.body.image_url || req.body.imageUrl;
    
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const updates = { ...req.body };
    if (imageUrl) {
      updates.image_url = imageUrl;
    }
    if (updates.sort_order !== undefined) updates.sort_order = parseInt(updates.sort_order);
    if (updates.is_active !== undefined) updates.is_active = updates.is_active === 'true' || updates.is_active === true;

    const updated = await db.banners.update(id, updates);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Banner updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await db.banners.delete(id);

    return res.status(200).json({
      success: true,
      data: deleted,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


// --- ORDERS MANAGEMENT ---
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    
    // Set default parsing for 'today' query option
    let filterDate = date;
    if (date === 'today') {
      filterDate = new Date().toISOString().split('T')[0];
    }

    const orders = await db.orders.findAll({ status, date: filterDate });

    return res.status(200).json({
      success: true,
      data: orders,
      message: 'All orders fetched'
    });
  } catch (error) {
    next(error);
  }
};

const assignRider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rider_id } = req.body;

    if (!rider_id) {
      return res.status(400).json({
        success: false,
        message: 'rider_id is required',
        error: 'VALIDATION_ERROR'
      });
    }

    const updatedOrder = await db.orders.assignRider(id, rider_id);

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Rider assigned to order successfully'
    });
  } catch (error) {
    next(error);
  }
};


// --- REPORTS & STATS ---
const getSalesReport = async (req, res, next) => {
  try {
    const { period = 'today' } = req.query; // today, week, month

    if (!['today', 'week', 'month'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sales period. Use: today, week, or month',
        error: 'VALIDATION_ERROR'
      });
    }

    const report = await db.orders.getSalesReport(period);

    return res.status(200).json({
      success: true,
      data: report,
      message: `Sales report for ${period} generated`
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await db.orders.getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Dashboard statistics fetched'
    });
  } catch (error) {
    next(error);
  }
};

const getBanners = async (req, res, next) => {
  try {
    const banners = await db.banners.findAll(true);
    return res.status(200).json({
      success: true,
      data: banners,
      message: 'All banners fetched for admin'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createBanner,
  updateBanner,
  deleteBanner,
  getBanners,
  getAdminOrders,
  assignRider,
  getSalesReport,
  getDashboardStats
};
