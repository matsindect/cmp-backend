const express = require('express');
const authController = require('./../controllers/authController');
const profileController = require('./../controllers/profile');

const router = express.Router();
router
  .route('/')
  .post(authController.protect, profileController.createProfile)
  .get(authController.protect, profileController.getAllProfiles);

router
  .route('/:id')
  .get(authController.protect, profileController.getProfile)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    profileController.deleteProfile
  );

module.exports = router;
