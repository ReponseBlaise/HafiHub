import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes
router.get('/', authMiddleware, bookingController.listBookings);
router.post('/', authMiddleware, bookingController.createBooking);
router.delete('/:id', authMiddleware, bookingController.cancelBooking);

export default router;
