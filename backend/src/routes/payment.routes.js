import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  createPaymentProfile,
  getPaymentProfile,
  initiateVerification,
  verifyPaymentProfile,
  makePayment,
  getTransactionHistory,
  getTransaction,
  paymentWebhook
} from '../controllers/payment.controller.js';

const router = express.Router();

// Payment profile routes
router.post('/profile', authMiddleware, createPaymentProfile);
router.get('/profile', authMiddleware, getPaymentProfile);

// Payment verification
router.post('/verify/initiate', authMiddleware, initiateVerification);
router.post('/verify/confirm', authMiddleware, verifyPaymentProfile);

// Make payment
router.post('/make', authMiddleware, makePayment);

// Transaction history
router.get('/transactions', authMiddleware, getTransactionHistory);
router.get('/transactions/:id', authMiddleware, getTransaction);

// Webhook for payment confirmation
router.post('/webhook/payment', paymentWebhook);

export default router;
