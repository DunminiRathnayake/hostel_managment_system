const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student routes
router.post('/', protect, authorize('student'), createComplaint);
router.get('/my-complaints', protect, getMyComplaints);

// Warden routes
router.get('/', protect, authorize('warden'), getAllComplaints);
router.put('/:id/status', protect, authorize('warden'), updateComplaintStatus);

module.exports = router;
