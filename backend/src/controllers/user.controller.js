import * as userService from '../services/user.service.js';

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: 'User ID required' });
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const profile = await userService.getUserProfile(parsedUserId);

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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, location, contact, profilePictureUrl } = req.body;

    if (!name || !email || !contact) {
      return res.status(400).json({ error: 'Name, email, and contact are required' });
    }

    const updatedUser = await userService.updateProfile(userId, {
      name,
      email,
      location,
      contact,
      profilePictureUrl
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : error.message.includes('already in use') ? 409 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
