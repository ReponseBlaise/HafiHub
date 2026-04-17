const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createPaymentProfile,
  getPaymentProfile,
  initiateVerification,
  verifyPaymentProfile,
  makePayment,
  getTransactionHistory,
  getTransaction,
  paymentWebhook
} = require('../controllers/payment.controller');

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

module.exports = router;
