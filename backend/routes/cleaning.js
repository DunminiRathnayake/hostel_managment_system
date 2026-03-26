const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createCleaningTask,
    getAllCleaningTasks,
    updateCleaningStatus
} = require('../controllers/cleaningController');

router.post('/', protect, authorize('warden'), createCleaningTask);
router.get('/', protect, getAllCleaningTasks);
router.put('/:id', protect, authorize('warden'), updateCleaningStatus);

module.exports = router;
