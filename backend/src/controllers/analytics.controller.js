import prisma from '../utils/db.js';

// ============ SPRINT 19: MULTI-LANGUAGE SUPPORT ============

// Get user language preference
export const getUserLanguage = async (req, res) => {
  try {
    const userId = req.user.id;

    let preference = await prisma.userLanguagePreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      preference = await prisma.userLanguagePreference.create({
        data: { userId, language: 'en' }
      });
    }

    res.json({ success: true, data: preference });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update language preference
export const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language } = req.body;

    const validLanguages = ['en', 'rw', 'fr'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ success: false, message: 'Unsupported language. Supported: en, rw, fr' });
    }

    let preference = await prisma.userLanguagePreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      preference = await prisma.userLanguagePreference.create({
        data: { userId, language }
      });
    } else {
      preference = await prisma.userLanguagePreference.update({
        where: { userId },
        data: { language }
      });
    }

    res.json({ success: true, data: preference, message: 'Language preference updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SPRINT 21: ANALYTICS & ECONOMIC TRACKING ============

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    });

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: { userId }
      });
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user earnings
export const updateUserEarnings = async (userId, amount) => {
  try {
    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    });

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: { userId, totalEarnings: amount }
      });
    } else {
      analytics = await prisma.userAnalytics.update({
        where: { userId },
        data: { totalEarnings: { increment: amount } }
      });
    }

    return analytics;
  } catch (error) {
    console.error('Error updating user earnings:', error);
  }
};

// Update job completion stats
export const recordJobCompletion = async (userId, amount) => {
  try {
    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    });

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: {
          userId,
          jobsCompleted: 1,
          totalEarnings: amount
        }
      });
    } else {
      analytics = await prisma.userAnalytics.update({
        where: { userId },
        data: {
          jobsCompleted: { increment: 1 },
          totalEarnings: { increment: amount }
        }
      });
    }

    return analytics;
  } catch (error) {
    console.error('Error recording job completion:', error);
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };

    const analytics = await prisma.platformAnalytics.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user statistics
export const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;

    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId: parseInt(userId) }
    });

    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: parseInt(userId) }
    });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    const jobsPosted = await prisma.post.count({
      where: { userId: parseInt(userId), category: { in: ['job', 'quick_job'] } }
    });

    res.json({
      success: true,
      data: {
        ...userAnalytics,
        avgRating: parseFloat(avgRating),
        reviewCount: reviews.length,
        jobsPosted
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get economic impact (Rwanda context)
export const getEconomicImpact = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTransactions = await prisma.transaction.count({
      where: { status: 'completed' }
    });
    const totalEarnings = await prisma.transaction.aggregate({
      where: { type: 'payment_received', status: 'completed' },
      _sum: { amount: true }
    });

    const completedJobs = await prisma.jobStatusHistory.count({
      where: { status: 'COMPLETED' }
    });

    const avgJobValue = completedJobs > 0
      ? (totalEarnings._sum.amount || 0) / completedJobs
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalEarnings: totalEarnings._sum.amount || 0,
        completedJobs,
        avgJobValue: parseFloat(avgJobValue.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SPRINT 20: LOW-BANDWIDTH OPTIMIZATION ============

// Get minimized user profile (for low bandwidth)
export const getMinimalUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        profilePictureUrl: true,
        location: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: parseInt(userId) },
      select: { rating: true }
    });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({
      success: true,
      data: {
        ...user,
        avgRating: avgRating ? parseFloat(avgRating) : null,
        reviewCount: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get minimized posts list (for low bandwidth)
export const getMinimalPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        user: {
          select: { id: true, name: true }
        },
        createdAt: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.post.count();

    res.json({
      success: true,
      data: posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
