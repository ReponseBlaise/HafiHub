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
      contact: true,
      profilePictureUrl: true,
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

  // Flatten user object with stats for frontend
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    location: user.location,
    contact: user.contact,
    profilePictureUrl: user.profilePictureUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    postsCount,
    commentsCount,
    likesReceived,
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

export const updateProfile = async (userId, { name, email, location, contact, profilePictureUrl }) => {
  if (!userId) {
    throw new Error('User ID required');
  }

  // Validate required fields
  if (!name || !email || !contact) {
    throw new Error('Name, email, and contact are required');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if new email is already taken by another user
  if (email !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      throw new Error('Email already in use');
    }
  }

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      location: location?.trim() || null,
      contact: contact.trim(),
      profilePictureUrl: profilePictureUrl || null,
      updatedAt: new Date()
    },
    select: {
      id: true,
      email: true,
      name: true,
      location: true,
      contact: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return updatedUser;
};
