const { prisma } = require('../db');

// Create a bid for a job post
exports.placeBid = async (req, res) => {
  try {
    const { postId } = req.params;
    const { bidAmount, message } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Check if user already bid
    const existingBid = await prisma.jobBid.findFirst({
      where: { postId: parseInt(postId), userId }
    });

    if (existingBid) {
      return res.status(400).json({ success: false, message: 'You already placed a bid on this post' });
    }

    const bid = await prisma.jobBid.create({
      data: {
        postId: parseInt(postId),
        userId,
        bidAmount: parseFloat(bidAmount),
        message
      },
      include: { user: { select: { id: true, name: true, profilePictureUrl: true, contact: true } } }
    });

    res.status(201).json({ success: true, data: bid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bids for a post (author only)
exports.getPostBids = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Only post author can view bids' });
    }

    const bids = await prisma.jobBid.findMany({
      where: { postId: parseInt(postId) },
      include: { user: { select: { id: true, name: true, profilePictureUrl: true, contact: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept a bid
exports.acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.id;

    const bid = await prisma.jobBid.findUnique({
      where: { id: parseInt(bidId) },
      include: { post: true }
    });

    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
    if (bid.post.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const acceptance = await prisma.jobAcceptance.create({
      data: {
        bidId: parseInt(bidId),
        postId: bid.postId,
        userId: bid.userId
      }
    });

    await prisma.jobBid.update({
      where: { id: parseInt(bidId) },
      data: { status: 'accepted' }
    });

    // Create notification for the worker
    await prisma.notification.create({
      data: {
        userId: bid.userId,
        type: 'job_accepted',
        title: 'Your Bid Was Accepted!',
        message: `Your bid for "${bid.post.title}" has been accepted`,
        relatedId: bid.postId
      }
    });

    res.json({ success: true, data: acceptance, message: 'Bid accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject a bid
exports.rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.id;

    const bid = await prisma.jobBid.findUnique({
      where: { id: parseInt(bidId) },
      include: { post: true }
    });

    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
    if (bid.post.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.jobBid.update({
      where: { id: parseInt(bidId) },
      data: { status: 'rejected' }
    });

    res.json({ success: true, message: 'Bid rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const validStatuses = ['POSTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const history = await prisma.jobStatusHistory.create({
      data: {
        postId: parseInt(postId),
        status,
        changedBy: userId
      }
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get job status history
exports.getJobStatusHistory = async (req, res) => {
  try {
    const { postId } = req.params;

    const history = await prisma.jobStatusHistory.findMany({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my bids (worker view)
exports.getMyBids = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const bids = await prisma.jobBid.findMany({
      where: { userId },
      include: {
        post: { select: { id: true, title: true, category: true, location: true } },
        acceptance: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.jobBid.count({ where: { userId } });

    res.json({
      success: true,
      data: bids,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
