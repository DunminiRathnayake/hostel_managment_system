const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    submitPayment, 
    getMyPayments, 
    getAllPayments, 
    updatePaymentStatus 
} = require('../controllers/paymentController');

// Student specific routes
router.post('/', protect, authorize('student'), (req, res, next) => {
    upload.single('slipImage')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, submitPayment);
router.get('/my', protect, authorize('student'), getMyPayments);

// Warden specific routes
router.get('/', protect, authorize('warden'), getAllPayments);
router.put('/:id', protect, authorize('warden'), updatePaymentStatus);

module.exports = router;
