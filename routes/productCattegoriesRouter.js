const express = require('express');
const authController = require('./../controllers/authController');
const ProductCategoryController = require('./../controllers/product-categories');

const router = express.Router();
router
  .route('/')
  .post(
    // authController.protect,
    // authController.restrictTo('admin'),
    ProductCategoryController.createProductCategory
  )
  .get(
    // authController.protect,
    // authController.restrictTo('admin'),
    ProductCategoryController.getAllProductCategories
  );

router.route('/:id').get(
  // authController.protect,
  // authController.restrictTo('admin'),
  ProductCategoryController.getOneProductCategory
);
router.route('/delete').post(
  // authController.protect,
  // authController.restrictTo('admin'),
  ProductCategoryController.deleteProductCategory
);

module.exports = router;
