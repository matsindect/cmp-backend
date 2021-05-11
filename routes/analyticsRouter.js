const express = require('express');
const authController = require('./../controllers/authController');
const AnalyticsController = require('./../controllers/analytics');

const router = express.Router();
router
  .route('/')
  //   .post(AnalyticsController.createBusinessType)
  .get(AnalyticsController.getAnalytics);

// router
//   .route('/:id')
//   .get(AnalyticsController.getOneBusinessType)
//   .delete(AnalyticsController.deleteBusinessType);

module.exports = router;
