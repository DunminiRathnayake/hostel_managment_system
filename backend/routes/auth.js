const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Register API
router.post('/register', registerUser);

// Login API
router.post('/login', loginUser);

module.exports = router;
