import prisma from '../utils/db.js';

export const getAllPosts = async (limit = 20, skip = 0) => {
  const posts = await prisma.post.findMany({
    take: limit,
    skip: skip,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      comments: {
        select: { id: true }
      },
      likes: {
        select: { id: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Add counts
  const postsWithCounts = posts.map(post => ({
    ...post,
    commentCount: post.comments.length,
    likeCount: post.likes.length,
    comments: undefined,
    likes: undefined
  }));

  const total = await prisma.post.count();

  return { posts: postsWithCounts, total };
};

export const createPost = async (title, description, category, location, userId, imageUrl = null) => {
  const post = await prisma.post.create({
    data: {
      title,
      description,
      category,
      location,
      imageUrl: imageUrl || null,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return post;
};

export const getPostById = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      comments: {
        select: { id: true }
      },
      likes: {
        select: { id: true }
      }
    }
  });

  if (post) {
    return {
      ...post,
      commentCount: post.comments.length,
      likeCount: post.likes.length,
      comments: undefined,
      likes: undefined
    };
  }

  return post;
};

export const searchPosts = async (filters = {}, limit = 20, skip = 0) => {
  const { search, category, location } = filters;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      {
        title: {
          contains: search
        }
      },
      {
        description: {
          contains: search
        }
      }
    ];
  }

  if (category) {
    where.category = category;
  }

  if (location) {
    where.location = {
      contains: location
    };
  }

  const posts = await prisma.post.findMany({
    where,
    take: limit,
    skip,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      comments: {
        select: { id: true }
      },
      likes: {
        select: { id: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Add counts
  const postsWithCounts = posts.map(post => ({
    ...post,
    commentCount: post.comments.length,
    likeCount: post.likes.length,
    comments: undefined,
    likes: undefined
  }));

  const total = await prisma.post.count({ where });

  return {
    posts: postsWithCounts,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updatePost = async (postId, userId, title, description, category, location, imageUrl) => {
  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.userId !== userId) {
    throw new Error('Not authorized to update this post');
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      title: title || post.title,
      description: description || post.description,
      category: category || post.category,
      location: location || post.location,
      imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      comments: {
        select: { id: true }
      },
      likes: {
        select: { id: true }
      }
    }
  });

  return {
    ...updated,
    commentCount: updated.comments.length,
    likeCount: updated.likes.length,
    comments: undefined,
    likes: undefined
  };
};

export const deletePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.userId !== userId) {
    throw new Error('Not authorized to delete this post');
  }

  await prisma.post.delete({
    where: { id: postId }
  });

  return { success: true, message: 'Post deleted' };
};
