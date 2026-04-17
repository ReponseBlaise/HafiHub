const { prisma } = require('../db');

// ============ SPRINT 16: AVAILABILITY ============

// Get user availability
exports.getAvailability = async (req, res) => {
  try {
    const { userId } = req.params;

    let availability = await prisma.userAvailability.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!availability) {
      availability = await prisma.userAvailability.create({
        data: { userId: parseInt(userId) }
      });
    }

    res.json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update availability status
exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, availableFrom, availableUntil, hourlyRate, timezone } = req.body;

    const validStatuses = ['AVAILABLE_NOW', 'AVAILABLE_SOON', 'UNAVAILABLE'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let availability = await prisma.userAvailability.findUnique({
      where: { userId }
    });

    if (!availability) {
      availability = await prisma.userAvailability.create({
        data: {
          userId,
          status: status || 'AVAILABLE_SOON',
          availableFrom: availableFrom ? new Date(availableFrom) : null,
          availableUntil: availableUntil ? new Date(availableUntil) : null,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          timezone: timezone || 'Africa/Kigali'
        }
      });
    } else {
      availability = await prisma.userAvailability.update({
        where: { userId },
        data: {
          ...(status && { status }),
          ...(availableFrom && { availableFrom: new Date(availableFrom) }),
          ...(availableUntil && { availableUntil: new Date(availableUntil) }),
          ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate) }),
          ...(timezone && { timezone })
        }
      });
    }

    res.json({ success: true, data: availability, message: 'Availability updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available workers
exports.getAvailableWorkers = async (req, res) => {
  try {
    const { status = 'AVAILABLE_NOW', page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const workers = await prisma.userAvailability.findMany({
      where: { status },
      include: { user: { select: { id: true, name: true, profilePictureUrl: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { updatedAt: 'desc' }
    });

    const total = await prisma.userAvailability.count({ where: { status } });

    res.json({
      success: true,
      data: workers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SPRINT 17: BLOCKING & REPORTING ============

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const blockingUserId = req.user.id;
    const { blockedUserId } = req.params;
    const { reason } = req.body;

    if (blockingUserId === parseInt(blockedUserId)) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' });
    }

    const block = await prisma.userBlock.create({
      data: {
        blockingUserId,
        blockedUserId: parseInt(blockedUserId),
        reason
      }
    });

    res.json({ success: true, data: block, message: 'User blocked' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'User already blocked' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const blockingUserId = req.user.id;
    const { blockedUserId } = req.params;

    await prisma.userBlock.deleteMany({
      where: {
        blockingUserId,
        blockedUserId: parseInt(blockedUserId)
      }
    });

    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get blocked users
exports.getBlockedUsers = async (req, res) => {
  try {
    const blockingUserId = req.user.id;

    const blocks = await prisma.userBlock.findMany({
      where: { blockingUserId },
      include: { blockedUser: { select: { id: true, name: true, profilePictureUrl: true } } }
    });

    res.json({ success: true, data: blocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Report a user or post
exports.createReport = async (req, res) => {
  try {
    const reportedById = req.user.id;
    const { reportedUserId, postId, reason, description } = req.body;

    const validReasons = ['SCAM', 'HARASSMENT', 'SPAM', 'INAPPROPRIATE', 'OTHER'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid reason' });
    }

    const report = await prisma.report.create({
      data: {
        reportedById,
        reportedUserId: reportedUserId ? parseInt(reportedUserId) : null,
        postId: postId ? parseInt(postId) : null,
        reason,
        description
      }
    });

    res.status(201).json({ success: true, data: report, message: 'Report submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports (admin only)
exports.getReports = async (req, res) => {
  try {
    // TODO: Check if user is admin
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const reports = await prisma.report.findMany({
      where: { status },
      include: {
        reportedBy: { select: { id: true, name: true } },
        reportedUser: { select: { id: true, name: true } }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.report.count({ where: { status } });

    res.json({
      success: true,
      data: reports,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve a report (admin only)
exports.resolveReport = async (req, res) => {
  try {
    // TODO: Check if user is admin
    const { id } = req.params;
    const { status, resolution } = req.body;

    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status, resolution }
    });

    res.json({ success: true, data: report, message: 'Report resolved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SPRINT 18: FILE UPLOAD & IMAGES ============

// Upload user photo
exports.uploadUserPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { url, format = 'webp', width, height, size } = req.body;

    const photo = await prisma.userPhoto.create({
      data: {
        userId,
        url,
        format,
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        size: size ? parseInt(size) : 0,
        isPrimary: true
      }
    });

    // Remove primary flag from other photos
    await prisma.userPhoto.updateMany({
      where: { userId, id: { not: photo.id } },
      data: { isPrimary: false }
    });

    res.status(201).json({ success: true, data: photo, message: 'Photo uploaded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user photos
exports.getUserPhotos = async (req, res) => {
  try {
    const { userId } = req.params;

    const photos = await prisma.userPhoto.findMany({
      where: { userId: parseInt(userId) },
      orderBy: [{ isPrimary: 'desc' }, { uploadedAt: 'desc' }]
    });

    res.json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user photo
exports.deleteUserPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const photo = await prisma.userPhoto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!photo || photo.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.userPhoto.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
