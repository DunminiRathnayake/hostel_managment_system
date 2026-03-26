const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    scanQR, 
    getAllRecords, 
    getLateStudents, 
    getMonthlyReport,
    getMyCheckIns
} = require('../controllers/checkinController');

// Open QR Device Endpoint (Publicly mapped so hardware APIs can hit it directly)
router.post('/scan', scanQR);

// Secure administrative paths mapping directly to Warden views
router.get('/', protect, authorize('warden'), getAllRecords);
router.get('/late', protect, authorize('warden'), getLateStudents);
router.get('/monthly-report', protect, authorize('warden'), getMonthlyReport);

// Student Endpoints mapped explicitly targeting local hooks securely natively
router.get('/my', protect, authorize('student'), getMyCheckIns);

module.exports = router;
