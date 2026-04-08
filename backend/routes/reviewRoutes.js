const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { addOrUpdateReview, getReviews, getAverageRating, deleteReview } = require('../controllers/reviewController');

// Public endpoints
router.get('/', getReviews);
router.get('/average', getAverageRating);

// Protected student-only endpoints
router.post('/', protect, authorize('student'), addOrUpdateReview);
router.put('/', protect, authorize('student'), addOrUpdateReview); // Uses same flexible addOrUpdate logic

// Administrative endpoints
router.delete('/:id', protect, authorize('warden'), deleteReview);

module.exports = router;
