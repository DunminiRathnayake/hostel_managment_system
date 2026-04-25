const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getProfile, updateProfile, getStudentsList, getMyQR, deactivateStudent, getLoginLogs, updateStudentAsWarden } = require('../controllers/userController');

// Public lookup routes targeting specific identifiers
router.get('/students', getStudentsList);

// All profile calls inherently strictly require authenticated bounds avoiding generic parsing natively
router.get('/profile', protect, getProfile);
router.put('/profile', protect, (req, res, next) => {
    upload.fields([{ name: 'nicFront', maxCount: 1 }, { name: 'nicBack', maxCount: 1 }])(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, updateProfile);
router.get('/my-qr', protect, getMyQR);

router.put('/deactivate/:id', protect, deactivateStudent);
router.put('/student/:id', protect, updateStudentAsWarden);
router.get('/login-logs', protect, getLoginLogs);

module.exports = router;
