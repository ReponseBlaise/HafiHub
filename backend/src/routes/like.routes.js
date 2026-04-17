import express from 'express';
import * as likeController from '../controllers/like.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// POST /likes - Toggle like on post (protected)
router.post('/', authMiddleware, likeController.toggleLike);

// GET /likes/:postId - Get like count for a post (public)
router.get('/:postId', likeController.getLikeCount);

export default router;
