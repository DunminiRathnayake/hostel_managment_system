const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createNotice, getActiveNotice, clearNotice } = require('../controllers/noticeController');

// All users can read the active broadcast safely
router.get('/active', protect, getActiveNotice);

// Strictly Wardens can post or clear global broadcasts
router.post('/', protect, authorize('warden', 'admin'), createNotice);
router.delete('/clear', protect, authorize('warden', 'admin'), clearNotice);

module.exports = router;
