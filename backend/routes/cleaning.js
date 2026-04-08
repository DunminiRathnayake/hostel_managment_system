const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllCleaningTasks,
    getStudentCleaningTasks,
    updateCleaningStatus,
    getTodayTasksFormatted
} = require('../controllers/cleaningController');

router.get('/', protect, getAllCleaningTasks);
router.get('/student', protect, authorize('student'), getStudentCleaningTasks);
router.get('/today', protect, getTodayTasksFormatted);
router.put('/:id', protect, authorize('warden'), updateCleaningStatus);

module.exports = router;
