import * as postService from '../services/post.service.js';

export const listPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { posts, total } = await postService.getAllPosts(limit, skip);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    // Validate input
    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create post
    const post = await postService.createPost(
      title,
      description,
      category,
      location,
      req.userId
    );

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postService.getPostById(parseInt(id));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { search, category, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (location) filters.location = location;

    const result = await postService.searchPosts(filters, limit, skip);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location } = req.body;

    // Validate input
    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = await postService.updatePost(
      parseInt(id),
      req.userId,
      title,
      description,
      category,
      location
    );

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await postService.deletePost(parseInt(id), req.userId);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
