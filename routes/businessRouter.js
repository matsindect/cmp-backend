const express = require('express');
const authController = require('./../controllers/authController');
const BusinessTypeController = require('./../controllers/business');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    BusinessTypeController.createBusinessType
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    BusinessTypeController.getAllBusinessTypes
  );

router
  .route('/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    BusinessTypeController.getOneBusinessType
  ).patch(authController.protect, BusinessTypeController.updateBusinessType)
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    BusinessTypeController.deleteBusinessType
  );

module.exports = router;
