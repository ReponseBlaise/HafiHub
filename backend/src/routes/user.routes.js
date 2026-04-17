import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// GET /users/search - Search users by name or location (must come BEFORE /:userId)
router.get('/search', userController.searchUsers);

// GET /users/:userId - Get user profile with stats
router.get('/:userId', userController.getUserProfile);

// PUT /users/profile - Update user profile (protected)
router.put('/profile/update', authMiddleware, userController.updateProfile);

export default router;
