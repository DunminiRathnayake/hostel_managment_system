const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getWardenOverview } = require('../controllers/dashboardController');

router.get('/', protect, authorize('warden'), getWardenOverview);

module.exports = router;
