const db = require('../utils/dbHelper');

const getBanners = async (req, res, next) => {
  try {
    const banners = await db.banners.findAll();
    
    return res.status(200).json({
      success: true,
      data: banners,
      message: 'Banners fetched'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners
};
