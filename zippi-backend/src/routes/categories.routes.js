const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

router.get('/', categoriesController.getCategories);
router.get('/:slug/products', categoriesController.getCategoryProducts);

module.exports = router;
