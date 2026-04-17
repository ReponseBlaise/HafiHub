import express from 'express';
import * as newsController from '../controllers/news.controller.js';

const router = express.Router();

// Public routes
router.get('/', newsController.listNews);
router.get('/:id', newsController.getNews);

// Admin routes (no auth check for now, can be added later)
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

export default router;
