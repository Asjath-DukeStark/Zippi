const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

router.get('/', productsController.getProducts);
router.get('/featured', productsController.getFeaturedProducts);
router.get('/flash-deals', productsController.getFlashDeals);
router.get('/:id', productsController.getProductById);

module.exports = router;
