const express = require('express');
const authController = require('./../controllers/authController');
const PostController = require('./../controllers/post');

const router = express.Router();
router
  .route('/')
  .post(authController.protect, PostController.createPost)
  .get(authController.protect, PostController.getAllPosts);

router
  .route('/:id')
  .get(authController.protect, PostController.getOnePost)
  .delete(authController.protect, PostController.deletePost);

module.exports = router;
