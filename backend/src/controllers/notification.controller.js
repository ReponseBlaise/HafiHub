const { prisma } = require('../db');

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly === 'true' && { isRead: false })
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.notification.count({
      where: {
        userId,
        ...(unreadOnly === 'true' && { isRead: false })
      }
    });

    res.json({
      success: true,
      data: notifications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.notification.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create notification (internal use - for services to call)
exports.createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, message, relatedId }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
