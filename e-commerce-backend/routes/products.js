const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Handles GET requests to the root of this router (/api/products)
router.get('/', productController.getProducts);

module.exports = router;