import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserRating
} from '../controllers/review.controller.js';

const router = express.Router();

// Get reviews for a user
router.get('/user/:userId', getUserReviews);

// Get user's average rating
router.get('/user/:userId/rating', getUserRating);

// Create review (auth required)
router.post('/', authMiddleware, createReview);

// Update review (auth required)
router.patch('/:id', authMiddleware, updateReview);

// Delete review (auth required)
router.delete('/:id', authMiddleware, deleteReview);

export default router;
