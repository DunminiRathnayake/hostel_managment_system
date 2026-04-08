const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    createBooking, 
    getMyBookings, 
    getAllBookings, 
    updateBookingStatus,
    getStudentBookings
} = require('../controllers/bookingController');

// Global public visitor routes (Registration does not require JWT context)
router.post('/', createBooking);
router.get('/my', getMyBookings);

// Warden strictly allocated paths
router.get('/', protect, authorize('warden'), getAllBookings);
router.put('/:id', protect, authorize('warden'), updateBookingStatus);
router.get('/my-appointments', protect, getStudentBookings);

module.exports = router;
