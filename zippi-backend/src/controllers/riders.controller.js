const db = require('../utils/dbHelper');

const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required',
        error: 'VALIDATION_ERROR'
      });
    }

    const profile = await db.riders.updateLocation(userId, latitude, longitude);

    return res.status(200).json({
      success: true,
      data: profile,
      message: 'Rider GPS coordinates updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { is_online } = req.body;
    const userId = req.user.id;

    if (is_online === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_online status (true/false) is required',
        error: 'VALIDATION_ERROR'
      });
    }

    const profile = await db.riders.updateStatus(userId, is_online);

    return res.status(200).json({
      success: true,
      data: profile,
      message: `Rider is now ${is_online ? 'online' : 'offline'}`
    });
  } catch (error) {
    next(error);
  }
};

const getActiveOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activeOrder = await db.riders.findActiveOrder(userId);

    if (!activeOrder) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active order assigned'
      });
    }

    return res.status(200).json({
      success: true,
      data: activeOrder,
      message: 'Active order details fetched'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLocation,
  updateStatus,
  getActiveOrder
};
