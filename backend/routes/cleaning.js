const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllCleaningTasks,
    getStudentCleaningTasks,
    getTodayTasksFormatted,
    getCleaningSchedule,
    updateCleaningSchedule,
    updateCleaningStatus
} = require('../controllers/cleaningController');

router.get('/', protect, getAllCleaningTasks);
router.get('/schedule', protect, getCleaningSchedule);
router.post('/schedule', protect, authorize('warden'), updateCleaningSchedule);
router.get('/student', protect, authorize('student'), getStudentCleaningTasks);
router.get('/today', protect, getTodayTasksFormatted);
router.put('/:id', protect, authorize('warden'), updateCleaningStatus);

module.exports = router;
