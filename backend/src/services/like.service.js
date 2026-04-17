import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const toggleLike = async (postId, userId) => {
  if (!postId || !userId) {
    throw new Error('Missing required fields');
  }

  // Verify post exists
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new Error('Post not found');
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return { liked: false };
  } else {
    // Like
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    return { liked: true };
  }
};

export const getPostLikeCount = async (postId) => {
  const count = await prisma.like.count({
    where: { postId },
  });

  return count;
};

export const isPostLikedByUser = async (postId, userId) => {
  const like = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  return !!like;
};
