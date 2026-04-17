import * as commentService from '../services/comment.service.js';

export const createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!content || !postId) {
      return res.status(400).json({ error: 'Missing required fields: content, postId' });
    }

    const comment = await commentService.createComment(content, postId, userId);

    res.status(201).json({
      message: 'Comment created',
      data: comment,
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!postId) {
      return res.status(400).json({ error: 'Missing postId parameter' });
    }

    const skip = (page - 1) * limit;
    const result = await commentService.getPostComments(parseInt(postId), limit, skip);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId; // From auth middleware

    if (!commentId) {
      return res.status(400).json({ error: 'Missing commentId parameter' });
    }

    const result = await commentService.deleteComment(parseInt(commentId), userId);

    res.json(result);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
