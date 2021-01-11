const express = require('express');
const authController = require('./../controllers/authController');
const categoryController = require('./../controllers/categories');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  )
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.getAllCategories
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.getOneCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
