const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// Register API (with file uploads)
router.post('/register', upload.fields([
    { name: 'nicFront', maxCount: 1 },
    { name: 'nicBack', maxCount: 1 }
]), registerUser);

// Login API
router.post('/login', loginUser);

module.exports = router;
