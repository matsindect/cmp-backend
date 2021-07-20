const express = require('express');
const authController = require('./../controllers/authController');
const ProductAttributeController = require('./../controllers/product-attributes');

const router = express.Router();
router
  .route('/')
  .post(
    // authController.protect,
    // authController.restrictTo('admin'),
    ProductAttributeController.createProductAttribute
  )
  .get(
    // authController.protect,
    // authController.restrictTo('admin'),
    ProductAttributeController.getAllProductAttributes
  );

router.route('/:id').get(
  // authController.protect,
  // authController.restrictTo('admin'),
  ProductAttributeController.getOneProductAttribute
);
router.route('/delete').post(
  // authController.protect,
  // authController.restrictTo('admin'),
  ProductAttributeController.deleteProductAttribute
);

module.exports = router;
