import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);

// Protected routes
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

export default router;
