const express = require('express');
const authController = require('./../controllers/authController');
const productController = require('./../controllers/products');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    productController.createProduct
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    productController.getAllProducts
  );

router
  .route('/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    productController.getOneProduct
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    productController.delleteProduct
  );

module.exports = router;
