const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Protect all admin endpoints
router.use(authenticateUser);
router.use(requireAdmin);

// Products CRUD
router.post('/products', upload.single('image'), adminController.createProduct);
router.patch('/products/:id', upload.single('image'), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Categories CRUD
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Banners CRUD
router.post('/banners', upload.single('image'), adminController.createBanner);
router.patch('/banners/:id', upload.single('image'), adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// Orders management
router.get('/orders', adminController.getAdminOrders);
router.patch('/orders/:id/assign-rider', adminController.assignRider);

// Analytics
router.get('/reports/sales', adminController.getSalesReport);
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
