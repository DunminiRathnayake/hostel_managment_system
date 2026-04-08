const Room = require('../models/Room');
const Allocation = require('../models/Allocation');

// @route   POST /api/rooms
// @desc    Add a new room
// @access  Private/Warden
exports.addRoom = async (req, res) => {
    try {
        const { roomNumber, capacity, type, features } = req.body;

        // Validate required fields
        if (!roomNumber || !capacity || !type) {
            return res.status(400).json({ message: 'Please provide roomNumber, capacity, and type' });
        }

        // Check if room already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const newRoom = new Room({
            roomNumber,
            capacity,
            type,
            features: features || [],
        });

        await newRoom.save();
        res.status(201).json({ message: 'Room added successfully', room: newRoom });
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Private
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.status(200).json({ rooms });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/rooms/allocate
// @desc    Allocate a room to a student
// @access  Private/Warden
exports.allocateRoom = async (req, res) => {
    try {
        const { studentId, roomId } = req.body;

        if (!studentId || !roomId) {
            return res.status(400).json({ message: 'Please provide studentId and roomId' });
        }

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check capacity
        if (room.currentOccupancy >= room.capacity) {
            return res.status(400).json({ message: 'Room is already at full capacity' });
        }

        // Check if student already has an active allocation
        const existingAllocation = await Allocation.findOne({ studentId, status: 'active' });
        if (existingAllocation) {
            return res.status(400).json({ message: 'Student already has an active room allocation' });
        }

        // Create allocation
        const newAllocation = new Allocation({
            studentId,
            roomId,
        });

        await newAllocation.save();

        // Increase room occupancy
        room.currentOccupancy += 1;
        if (room.currentOccupancy >= room.capacity) {
            room.status = 'occupied';
        }
        await room.save();

        res.status(201).json({ message: 'Room allocated successfully', allocation: newAllocation });
    } catch (error) {
        console.error('Error allocating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/rooms/remove
// @desc    Remove student from room
// @access  Private/Warden
exports.removeStudent = async (req, res) => {
    try {
        const { studentId, roomId } = req.body;

        if (!studentId || !roomId) {
            return res.status(400).json({ message: 'Please provide studentId and roomId' });
        }

        // Find active allocation
        const allocation = await Allocation.findOne({ studentId, roomId, status: 'active' });
        if (!allocation) {
            return res.status(404).json({ message: 'Active allocation not found for this student and room' });
        }

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Update allocation status to 'left'
        allocation.status = 'left';
        await allocation.save();

        // Decrease room occupancy safely
        if (room.currentOccupancy > 0) {
            room.currentOccupancy -= 1;
            if (room.currentOccupancy < room.capacity && room.status === 'occupied') {
                room.status = 'available';
            }
            await room.save();
        }

        res.status(200).json({ message: 'Student removed from room successfully', allocation });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT /api/rooms/:id/status
// @desc    Update room status
// @access  Private/Warden
exports.updateRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room status updated', room });
    } catch (error) {
        console.error('Error updating room status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT /api/rooms/:id
// @desc    Update core room details
// @access  Private/Warden
exports.editRoom = async (req, res) => {
    try {
        const { roomNumber, capacity, type } = req.body;
        
        // Prevent capacity from explicitly being mapped lower than current residents safely
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Target room configuration lost.' });
        if (capacity < room.currentOccupancy) {
            return res.status(400).json({ message: 'Cannot set capacity strictly beneath current exact occupancy limit.' });
        }

        const updateData = { roomNumber, capacity, type };
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        res.status(200).json({ message: 'Room configuration updated', room: updatedRoom });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Room number already structurally exists.' });
        console.error('Error modifying room payload:', error);
        res.status(500).json({ message: 'Internal logic error editing framework.' });
    }
};

// @route   PUT /api/rooms/:id/group
// @desc    Update room group for cleaning
// @access  Private/Warden
exports.updateRoomGroup = async (req, res) => {
    try {
        const { group } = req.body;
        const room = await Room.findByIdAndUpdate(req.params.id, { group }, { new: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room group updated', room });
    } catch (error) {
        console.error('Error updating room group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
