import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', eventController.listEvents);

// Protected routes - specific paths before parameterized routes
router.get('/host/my-events', authMiddleware, eventController.getHostEvents);

// Protected routes
router.post('/', authMiddleware, eventController.createEvent);
router.get('/:id', eventController.getEvent);
router.get('/:id/bookings', authMiddleware, eventController.getEventBookings);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

export default router;
