import prisma from '../utils/db.js';

export async function listNews(req, res) {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.news.count({ where })
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getNews(req, res) {
  try {
    const { id } = req.params;
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) }
    });

    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createNews(req, res) {
  try {
    const { title, content, category, imageUrl, featured } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        category,
        imageUrl: imageUrl || null,
        featured: featured || false
      }
    });

    res.status(201).json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateNews(req, res) {
  try {
    const { id } = req.params;
    const { title, content, category, imageUrl, featured } = req.body;

    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) }
    });

    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    const updated = await prisma.news.update({
      where: { id: parseInt(id) },
      data: {
        title: title || news.title,
        content: content || news.content,
        category: category || news.category,
        imageUrl: imageUrl !== undefined ? imageUrl : news.imageUrl,
        featured: featured !== undefined ? featured : news.featured
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteNews(req, res) {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) }
    });

    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    await prisma.news.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
