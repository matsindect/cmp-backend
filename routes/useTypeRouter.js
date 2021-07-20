const express = require('express');
const authController = require('./../controllers/authController');
const userTypeController = require('./../controllers/categories/user-type');

const router = express.Router();
/// USer type Routes

router
  .route('/')
  .post(
    // authController.protect,
    // authController.restrictTo('admin'),
    userTypeController.createUsertype
  )
  .get(
    // authController.protect,
    // authController.restrictTo('admin'),
    userTypeController.getAllUsertypes
  );

router.route('/:id').get(
  // authController.protect,
  // authController.restrictTo('admin'),
  userTypeController.getOneUsertype
);

router.route('/delete').post(
  // authController.protect,
  // authController.restrictTo('admin'),
  userTypeController.deleteUsertype
);
module.exports = router;
