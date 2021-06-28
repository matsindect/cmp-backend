const express = require('express');
const authController = require('../controllers/authController');
const navigationController = require('../controllers/navigations');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    navigationController.createNavigation
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    navigationController.getAllNavigations
  );

router
  .route('/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    navigationController.getOneNavigation
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    navigationController.delleteNavigation
  );

module.exports = router;
