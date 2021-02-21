const express = require('express');
const authController = require('./../controllers/authController');
const ServiceController = require('./../controllers/service');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceController.createService
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceController.getAllServices
  );

router
  .route('/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceController.getOneService
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    ServiceController.deleteService
  );

module.exports = router;
