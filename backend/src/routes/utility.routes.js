import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  // Availability
  getAvailability,
  updateAvailability,
  getAvailableWorkers,
  // Blocking & Reporting
  blockUser,
  unblockUser,
  getBlockedUsers,
  createReport,
  getReports,
  resolveReport,
  // Photos
  uploadUserPhoto,
  getUserPhotos,
  deleteUserPhoto
} from '../controllers/utility.controller.js';

const router = express.Router();

// ============ AVAILABILITY ROUTES ============
router.get('/availability/:userId', getAvailability);
router.put('/availability', authMiddleware, updateAvailability);
router.get('/available/workers', getAvailableWorkers);

// ============ BLOCKING & REPORTING ROUTES ============
router.post('/block/:blockedUserId', authMiddleware, blockUser);
router.delete('/block/:blockedUserId', authMiddleware, unblockUser);
router.get('/blocked-users', authMiddleware, getBlockedUsers);

router.post('/report', authMiddleware, createReport);
router.get('/reports', authMiddleware, getReports); // TODO: admin check
router.patch('/reports/:id', authMiddleware, resolveReport); // TODO: admin check

// ============ PHOTO ROUTES ============
router.post('/photos', authMiddleware, uploadUserPhoto);
router.get('/photos/:userId', getUserPhotos);
router.delete('/photos/:id', authMiddleware, deleteUserPhoto);

export default router;
