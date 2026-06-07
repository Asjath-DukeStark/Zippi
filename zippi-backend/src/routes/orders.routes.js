const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { authenticateUser, requireRider } = require('../middleware/auth');

// Customer endpoints (requires auth)
router.post('/', authenticateUser, ordersController.createOrder);
router.get('/', authenticateUser, ordersController.getMyOrders);
router.get('/:id', authenticateUser, ordersController.getOrderById);

// Status updates (requires rider or admin authentication)
router.patch('/:id/status', authenticateUser, requireRider, ordersController.updateOrderStatus);

module.exports = router;
