const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/auth/access-token/:token', authController.verifyToken);

router.post('/forgot-password', authController.fogortPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-mypassword',
  authController.protect,
  authController.updatePassword
);
router.patch(
  '/update-current-user',
  authController.protect,
  userController.updateCurrentUser
);
router.delete(
  '/delete-current-user',
  authController.protect,
  userController.deleteCurrentUser
);
router
  .route('/')
  .get(authController.protect, userController.getUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  );

module.exports = router;
