const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
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
} = require('../controllers/analytics.controller');

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

module.exports = router;
