const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  placeBid,
  getPostBids,
  acceptBid,
  rejectBid,
  updateJobStatus,
  getJobStatusHistory,
  getMyBids
} = require('../controllers/job.controller');

// Get my bids (worker view)
router.get('/my-bids', authMiddleware, getMyBids);

// Place a bid on a post
router.post('/:postId/bid', authMiddleware, placeBid);

// Get bids for a post (author only)
router.get('/:postId/bids', authMiddleware, getPostBids);

// Accept a bid
router.post('/bid/:bidId/accept', authMiddleware, acceptBid);

// Reject a bid
router.post('/bid/:bidId/reject', authMiddleware, rejectBid);

// Update job status
router.patch('/:postId/status', authMiddleware, updateJobStatus);

// Get job status history
router.get('/:postId/status-history', getJobStatusHistory);

module.exports = router;
