const router = require('express').Router();
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const auth = require('../controllers/auth.controller');
const products = require('../controllers/products.controller');
const categories = require('../controllers/categories.controller');
const banners = require('../controllers/banners.controller');
const orders = require('../controllers/orders.controller');
const users = require('../controllers/users.controller');
const riders = require('../controllers/riders.controller');
const analytics = require('../controllers/analytics.controller');
const settings = require('../controllers/settings.controller');
const uploads = require('../controllers/uploads.controller');
const promotions = require('../controllers/promotions.controller');

/* ------------------------- Auth ------------------------- */
router.post('/auth/register', validate([
  body('phone').isString().trim().isLength({ min: 7, max: 20 }).withMessage('Valid phone number is required'),
  body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), auth.register);

router.post('/auth/login', validate([
  body('phone').isString().trim().notEmpty().withMessage('Phone is required'),
  body('password').isString().notEmpty().withMessage('Password is required')
]), auth.login);

router.get('/auth/me', requireAuth, auth.me);
router.patch('/auth/me', requireAuth, auth.updateMe);

/* ----------------- Public catalog (web/mobile) ----------------- */
router.get('/products', products.list);
router.get('/products/:id', products.get);
router.get('/categories', categories.list);
router.get('/banners', banners.list);
router.get('/settings', settings.getPublic);
router.post('/promotions/validate', promotions.validateCode);

/* ------------------------- Orders (customer) ------------------------- */
router.post('/orders', requireAuth, validate([
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('productId is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('deliveryAddress').isObject().withMessage('deliveryAddress is required'),
  body('paymentMethod').isIn(['COD', 'CARD']).withMessage('paymentMethod must be COD or CARD')
]), orders.create);
router.get('/orders/my', requireAuth, orders.listMine);
router.get('/orders/:id', requireAuth, orders.get);
router.post('/orders/:id/cancel', requireAuth, orders.cancelMine);

/* ------------------------- Rider ------------------------- */
const riderOnly = [requireAuth, requireRole('rider')];
router.get('/rider/me', ...riderOnly, riders.me);
router.patch('/rider/status', ...riderOnly, riders.updateStatus);
router.get('/rider/orders', ...riderOnly, orders.riderList);
router.patch('/rider/orders/:id/status', ...riderOnly, validate([
  body('status').isIn(['arriving', 'delivered']).withMessage('status must be arriving or delivered')
]), orders.riderSetStatus);

/* ------------------------- Admin ------------------------- */
const adminOnly = [requireAuth, requireRole('admin')];
const admin = require('express').Router();
router.use('/admin', ...adminOnly, admin);

// Analytics
admin.get('/analytics/summary', analytics.summary);
admin.get('/analytics/orders-by-day', analytics.ordersByDay);
admin.get('/analytics/top-products', analytics.topProducts);
admin.get('/analytics/report', analytics.report);

// Catalog management
const productRules = [
  body('name').optional().isString().trim().isLength({ min: 2 }).withMessage('Name too short'),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('stock must be >= 0')
];
admin.get('/products', products.list);
admin.post('/products', validate([
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('unit').isString().trim().notEmpty().withMessage('unit is required'),
  body('categorySlug').isString().trim().notEmpty().withMessage('categorySlug is required')
]), products.create);

const docUpload = require('multer')({
  storage: require('multer').memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
admin.post('/products/import', docUpload.single('file'), products.importExcel);

admin.patch('/products/:id', validate(productRules), products.update);
admin.delete('/products/:id', products.remove);

admin.get('/categories', categories.list);
admin.post('/categories', validate([
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Name is required')
]), categories.create);
admin.patch('/categories/:id', categories.update);
admin.delete('/categories/:id', categories.remove);

admin.get('/banners', banners.list);
admin.post('/banners', validate([
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('imageUrl').isString().trim().notEmpty().withMessage('imageUrl is required')
]), banners.create);
admin.patch('/banners/:id', banners.update);
admin.delete('/banners/:id', banners.remove);

// Orders
admin.get('/orders', orders.adminList);
admin.get('/orders/:id', orders.get);
admin.patch('/orders/:id/status', orders.adminSetStatus);
admin.patch('/orders/:id/assign', orders.adminAssignRider);

// Users & riders
admin.get('/users', users.list);
admin.get('/users/:id', users.get);
admin.post('/users', validate([
  body('phone').isString().trim().isLength({ min: 7, max: 20 }).withMessage('Valid phone is required'),
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('role').isIn(['customer', 'rider', 'admin']).withMessage('Invalid role'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), users.create);
admin.patch('/users/:id', users.update);
admin.delete('/users/:id', users.remove);
admin.get('/riders', riders.adminList);

// Promotions
admin.get('/promotions', promotions.list);
admin.post('/promotions', validate([
  body('code').isString().trim().isLength({ min: 3, max: 30 }).withMessage('Code must be 3-30 characters'),
  body('type').isIn(['percent', 'fixed']).withMessage('type must be percent or fixed'),
  body('value').isFloat({ min: 0 }).withMessage('value must be greater than or equal to 0')
]), promotions.create);
admin.patch('/promotions/:id', promotions.update);
admin.delete('/promotions/:id', promotions.remove);

// Settings & uploads
admin.put('/settings/:key', settings.update);
admin.post('/uploads', upload.single('image'), uploads.uploadImage);
admin.delete('/uploads', uploads.deleteImage);

module.exports = router;
