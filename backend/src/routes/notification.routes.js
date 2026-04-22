import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notification.controller.js';

const router = express.Router();

// Get user's notifications
router.get('/', authMiddleware, getNotifications);

// Get unread count
router.get('/unread/count', authMiddleware, getUnreadCount);

// Mark notification as read
router.patch('/:id/read', authMiddleware, markAsRead);

// Mark all as read
router.post('/read-all', authMiddleware, markAllAsRead);

// Delete notification
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
