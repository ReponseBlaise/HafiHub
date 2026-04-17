import prisma from '../utils/db.js';

export const getUserProfile = async (userId) => {
  if (!userId) {
    throw new Error('User ID required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      location: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get user stats
  const postsCount = await prisma.post.count({
    where: { userId },
  });

  const commentsCount = await prisma.comment.count({
    where: { userId },
  });

  // Get likes received on user's posts
  const userPosts = await prisma.post.findMany({
    where: { userId },
    select: { id: true },
  });

  const postIds = userPosts.map(p => p.id);

  const likesReceived = await prisma.like.count({
    where: {
      postId: {
        in: postIds,
      },
    },
  });

  // Get recent posts by user
  const recentPosts = await prisma.post.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      category: true,
      location: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    user,
    stats: {
      postsCount,
      commentsCount,
      likesReceived,
    },
    recentPosts,
  };
};

export const searchUsers = async (query, limit = 20, skip = 0) => {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query required');
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query
          },
        },
        {
          location: {
            contains: query
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      location: true,
      createdAt: true,
    },
    take: limit,
    skip,
  });

  const total = await prisma.user.count({
    where: {
      OR: [
        {
          name: {
            contains: query
          },
        },
        {
          location: {
            contains: query
          },
        },
      ],
    },
  });

  return {
    users,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
