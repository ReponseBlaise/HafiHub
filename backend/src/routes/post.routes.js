import express from 'express';
import * as postController from '../controllers/post.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', postController.listPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPost);

// Protected routes
router.post('/', authMiddleware, postController.createPost);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;
