const express = require('express');
const authController = require('./../controllers/authController');
const categoryController = require('./../controllers/categories');
const userTypeController = require('./../controllers/categories/user-type');
const categoryRouter = require('./businessRouter');

const router = express.Router();
router.use('/:id/registration', categoryRouter);
router
  .route('/')
  .post(
    // authController.protect,
    // authController.restrictTo('admin'),
    categoryController.createCategory
  )
  .get(
    // authController.protect,
    // authController.restrictTo('admin'),
    categoryController.getAllCategories
  );
router.route('/sub').get(
  // authController.protect,
  // authController.restrictTo('admin'),
  categoryController.getSubCategories
);

router.route('/:id').get(
  // authController.protect,
  // authController.restrictTo('admin'),
  categoryController.getOneCategory
);
router.route('/delete').post(
  // authController.protect,
  // authController.restrictTo('admin'),
  categoryController.deleteCategory
);

module.exports = router;
