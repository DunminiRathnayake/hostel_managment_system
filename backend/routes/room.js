const express = require('express');
const router = express.Router();
const {
    addRoom,
    getAllRooms,
    allocateRoom,
    removeStudent,
    updateRoomStatus,
    editRoom,
    updateRoomGroup,
    updateRoomOccupancy
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllRooms);
router.post('/', protect, authorize('warden'), addRoom);
router.post('/allocate', protect, authorize('warden'), allocateRoom);
router.post('/remove', protect, authorize('warden'), removeStudent);
router.put('/:id/status', protect, authorize('warden'), updateRoomStatus);
router.put('/:id', protect, authorize('warden'), editRoom);
router.put('/:id/group', protect, authorize('warden'), updateRoomGroup);
router.put('/:id/occupancy', protect, authorize('warden'), updateRoomOccupancy);

module.exports = router;
