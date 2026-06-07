const db = require('../utils/dbHelper');

const createOrder = async (req, res, next) => {
  try {
    const { items, delivery_address, payment_method, special_instructions } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0 || !delivery_address || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order structure or missing fields',
        error: 'VALIDATION_ERROR'
      });
    }

    // 1. Calculate values from database prices to prevent client-side tampering
    let subtotal = 0;
    let totalDiscount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await db.products.findById(item.product_id || item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product_id || item.productId} not found`,
          error: 'NOT_FOUND'
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
          error: 'OUT_OF_STOCK'
        });
      }

      const itemPrice = product.price;
      const originalPrice = product.original_price || itemPrice;
      const discountVal = (originalPrice - itemPrice) * item.quantity;

      subtotal += originalPrice * item.quantity;
      totalDiscount += discountVal;

      processedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: itemPrice // Saved purchase price
      });
    }

    const deliveryFee = 250; // flat rate LKR 250
    const total = subtotal - totalDiscount + deliveryFee;

    // 2. Generate unique order number (format: ZP-2026-XXXXX)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ZP-2026-${randomDigits}`;

    // 3. Create the order in DB
    const orderData = {
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      delivery_fee: deliveryFee,
      discount: totalDiscount,
      total,
      delivery_address,
      payment_method,
      special_instructions: special_instructions || '',
      delivery_eta_min: 25 // default estimate 25 min
    };

    const savedOrder = await db.orders.create(orderData, processedItems);

    // 4. (Optional) SMS sending simulation
    console.log(`[SMS SEND] SMS sent to client for Order: ${orderNumber}. Text: "Your Zippi order ${orderNumber} of LKR ${total} has been received and is being prepared!"`);

    return res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ordersList = await db.orders.findByUserId(userId);

    return res.status(200).json({
      success: true,
      data: ordersList,
      message: 'Customer orders fetched'
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await db.orders.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'NOT_FOUND'
      });
    }

    // Access control: customer can only view their own order
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
        error: 'FORBIDDEN'
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order details fetched'
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'dispatched', 'arriving', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Fetch the order to verify assignees
    const order = await db.orders.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'NOT_FOUND'
      });
    }

    // Rider permissions check: Rider can only update status if they are the assigned rider
    if (req.user.role === 'rider' && order.rider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this order',
        error: 'FORBIDDEN'
      });
    }

    const updated = await db.orders.updateStatus(id, status);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
