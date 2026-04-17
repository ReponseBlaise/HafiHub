import * as userService from '../services/user.service.js';

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const profile = await userService.getUserProfile(parseInt(userId));

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const skip = (page - 1) * limit;
    const result = await userService.searchUsers(query, limit, skip);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
