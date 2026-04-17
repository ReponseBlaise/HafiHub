import { prisma } from '../db.js';

// Get all reviews for a user
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: parseInt(userId) },
      include: { user: { select: { id: true, name: true, profilePictureUrl: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({
      where: { reviewedUserId: parseInt(userId) }
    });

    res.json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { rating, title, comment, reviewedUserId } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1-5' });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        title,
        comment,
        userId,
        reviewedUserId: parseInt(reviewedUserId)
      },
      include: { user: true }
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { rating: rating ? parseInt(rating) : undefined, title, comment },
      include: { user: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.review.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's average rating
export const getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: parseInt(userId) }
    });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    res.json({ success: true, data: { avgRating: parseFloat(avgRating), reviewCount: reviews.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
