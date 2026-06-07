const express = require('express');
const router = express.Router();
const ridersController = require('../controllers/riders.controller');
const { authenticateUser, requireRider } = require('../middleware/auth');

// All rider routes require auth and rider/admin role
router.use(authenticateUser);
router.use(requireRider);

router.patch('/location', ridersController.updateLocation);
router.patch('/status', ridersController.updateStatus);
router.get('/active-order', ridersController.getActiveOrder);

module.exports = router;
