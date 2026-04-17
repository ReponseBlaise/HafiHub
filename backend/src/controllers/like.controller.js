import * as likeService from '../services/like.service.js';

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!postId) {
      return res.status(400).json({ error: 'Missing required field: postId' });
    }

    const result = await likeService.toggleLike(parseInt(postId), userId);

    res.json(result);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Missing postId parameter' });
    }

    const count = await likeService.getPostLikeCount(parseInt(postId));

    res.json({ postId: parseInt(postId), likeCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
