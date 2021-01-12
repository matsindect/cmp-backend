const express = require('express');
const authController = require('./../controllers/authController');
const sectorController = require('./../controllers/sector');

const router = express.Router();
router
  .route('/')
  .post(
    authController.protect,
    // authController.restrictTo('admin'),
    sectorController.createSector
  )
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    sectorController.getAllSectors
  );

router
  .route('/:id')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    sectorController.getOneSector
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin'),
    sectorController.deleteSector
  );

module.exports = router;
