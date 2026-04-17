import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// GET /users/:userId - Get user profile with stats
router.get('/:userId', userController.getUserProfile);

// GET /users/search - Search users by name or location
router.get('/search', userController.searchUsers);

export default router;
