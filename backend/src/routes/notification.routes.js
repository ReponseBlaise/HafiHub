const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notification.controller');

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

module.exports = router;
