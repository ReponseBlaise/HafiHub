import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  // Language
  getUserLanguage,
  updateLanguage,
  // Analytics
  getUserAnalytics,
  getPlatformAnalytics,
  getUserStatistics,
  getEconomicImpact,
  // Low Bandwidth
  getMinimalUserProfile,
  getMinimalPosts
} from '../controllers/analytics.controller.js';

const router = express.Router();

// ============ LANGUAGE ROUTES ============
router.get('/language', authMiddleware, getUserLanguage);
router.put('/language', authMiddleware, updateLanguage);

// ============ ANALYTICS ROUTES ============
router.get('/my-analytics', authMiddleware, getUserAnalytics);
router.get('/user/:userId/statistics', getUserStatistics);
router.get('/platform', getPlatformAnalytics); // TODO: admin check

// ============ ECONOMIC IMPACT ============
router.get('/economic-impact', getEconomicImpact);

// ============ LOW BANDWIDTH OPTIMIZATION ============
router.get('/minimal/user/:userId', getMinimalUserProfile);
router.get('/minimal/posts', getMinimalPosts);

export default router;
