const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, getStudentsList, getMyQR } = require('../controllers/userController');

// Public lookup routes targeting specific identifiers
router.get('/students', getStudentsList);

// All profile calls inherently strictly require authenticated bounds avoiding generic parsing natively
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/my-qr', protect, getMyQR);

module.exports = router;
