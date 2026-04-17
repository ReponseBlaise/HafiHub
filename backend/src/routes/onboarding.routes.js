const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getOnboardingProgress,
  completeProfileSetup,
  completeSkillsSetup,
  completePaymentSetup,
  completePhotoUpload,
  completeOnboarding,
  skipStep
} = require('../controllers/onboarding.controller');

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

module.exports = router;
