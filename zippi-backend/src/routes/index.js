const express = require('express');
const router = express.Router();

const authRouter = require('./auth.routes');
const categoriesRouter = require('./categories.routes');
const productsRouter = require('./products.routes');
const ordersRouter = require('./orders.routes');
const bannersRouter = require('./banners.routes');
const ridersRouter = require('./riders.routes');
const adminRouter = require('./admin.routes');

// Mount Sub-routers
router.use('/auth', authRouter);
router.use('/categories', categoriesRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/banners', bannersRouter);
router.use('/riders', ridersRouter);
router.use('/admin', adminRouter);

module.exports = router;
