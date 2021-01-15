const express = require('express');
const authController = require('../controllers/authController');
const cityController = require('../controllers/settings/city');
const countryController = require('../controllers/settings/country');

const router = express.Router();
router
  .route('/city')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    cityController.createCity
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    cityController.getAllCities
  );
router
  .route('/country')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    countryController.createCountry
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    countryController.getAllCountries
  );

router
  .route('/country/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    countryController.getOneCountry
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    countryController.deleteCountry
  );

router
  .route('/city/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    cityController.getOneCity
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    cityController.deleteCity
  );

module.exports = router;
