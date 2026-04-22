import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Email verification routes
router.post('/send-verification', authController.sendVerificationCode);
router.post('/verify-email', authController.verifyEmail);

// Registration and login
router.post('/register', authController.completeRegistration);
router.post('/login', authController.login);

export default router;
