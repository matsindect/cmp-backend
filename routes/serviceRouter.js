const express = require('express');
const authController = require('./../controllers/authController');
const ServiceController = require('./../controllers/service');

const router = express.Router();
router
  .route('/')
  .post(
    // authController.protect,
    // authController.restrictTo('admin'),
    ServiceController.createService
  )
  .get(
    // authController.protect,
    // authController.restrictTo('admin'),
    ServiceController.getAllServices
  );

router.route('/:id').get(
  // authController.protect,
  // authController.restrictTo('admin'),
  ServiceController.getOneService
);
router.route('/delete').post(
  // authController.protect,
  // authController.restrictTo('admin'),
  ServiceController.deleteService
);

router.route('/by-business-type').post(
  authController.protect,
  // authController.restrictTo('admin'),
  ServiceController.getServiceByBusinessType
);
module.exports = router;
