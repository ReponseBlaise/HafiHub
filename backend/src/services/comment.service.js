import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createComment = async (content, postId, userId) => {
  if (!content || !postId || !userId) {
    throw new Error('Missing required fields');
  }

  if (content.trim().length === 0) {
    throw new Error('Comment cannot be empty');
  }

  // Verify post exists
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new Error('Post not found');
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return comment;
};

export const getPostComments = async (postId, limit = 20, skip = 0) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip,
  });

  const total = await prisma.comment.count({ where: { postId } });

  return {
    comments,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const deleteComment = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Only allow deletion by comment author
  if (comment.userId !== userId) {
    throw new Error('Not authorized to delete this comment');
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return { message: 'Comment deleted' };
};
