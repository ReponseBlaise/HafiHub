import express from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// POST /comments - Create comment (protected)
router.post('/', authMiddleware, commentController.createComment);

// GET /comments/:postId - Get comments for a post (public)
router.get('/:postId', commentController.getComments);

// DELETE /comments/:commentId - Delete comment (protected)
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

export default router;
