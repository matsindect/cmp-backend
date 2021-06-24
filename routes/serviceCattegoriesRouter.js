const express = require('express');
const authController = require('../controllers/authController');
const ServiceCategoryController = require('../controllers/service-categories');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceCategoryController.createServiceCategory
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceCategoryController.getAllServiceCategories
  );

router
  .route('/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceCategoryController.getOneServiceCategory
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceCategoryController.deleteServiceCategory
  );

module.exports = router;
