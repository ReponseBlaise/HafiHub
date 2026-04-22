import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  getOnboardingProgress,
  completeProfileSetup,
  completeSkillsSetup,
  completePaymentSetup,
  completePhotoUpload,
  completeOnboarding,
  skipStep
} from '../controllers/onboarding.controller.js';

const router = express.Router();

// Get onboarding progress
router.get('/progress', authMiddleware, getOnboardingProgress);

// Complete individual steps
router.post('/profile-setup', authMiddleware, completeProfileSetup);
router.post('/skills-setup', authMiddleware, completeSkillsSetup);
router.post('/payment-setup', authMiddleware, completePaymentSetup);
router.post('/photo-upload', authMiddleware, completePhotoUpload);

// Skip a step
router.post('/skip-step', authMiddleware, skipStep);

// Complete entire onboarding
router.post('/complete', authMiddleware, completeOnboarding);

export default router;
