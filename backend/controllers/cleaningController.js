const Cleaning = require('../models/Cleaning');
const Allocation = require('../models/Allocation');
const Room = require('../models/Room');

const CLEANING_AREAS = [
    "Common Bathroom 1", "Common Bathroom 2", 
    "Study Area", "Living Area", "Balcony", "Dining Area"
];

// Helper to auto-generate tasks for today using round-robin logic
const ensureTodaysTasks = async () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if any tasks exist for today
    const existingTasks = await Cleaning.find({ date: { $gte: startOfDay, $lte: endOfDay } });
    if (existingTasks.length > 0) return; // Already generated

    // Determine today's group (1 to 7) based on day of week
    // Sunday = 0, Monday = 1 ... Saturday = 6
    let currentDayIndex = today.getDay(); 
    const todayGroup = currentDayIndex === 0 ? 7 : currentDayIndex;

    // Get all rooms in today's group
    const groupRooms = await Room.find({ group: todayGroup });
    if (groupRooms.length === 0) return; // No rooms assigned to clean today

    // Distribute ALL areas round-robin
    const newTasks = [];
    CLEANING_AREAS.forEach((area, i) => {
        const room = groupRooms[i % groupRooms.length];
        newTasks.push({
            area,
            assignedRoom: room._id,
            date: today,
            status: 'pending'
        });
    });

    if (newTasks.length > 0) {
        await Cleaning.insertMany(newTasks);
    }
};

exports.getAllCleaningTasks = async (req, res) => {
    try {
        await ensureTodaysTasks();

        const today = new Date();
        const startOfDay = new Date(today).setHours(0, 0, 0, 0);
        const endOfDay = new Date(today).setHours(23, 59, 59, 999);

        let tasks = await Cleaning.find({ date: { $gte: startOfDay, $lte: endOfDay } })
            .populate('assignedRoom', 'roomNumber type group')
            .sort({ createdAt: -1 });
        
        // Push pending to the top organically
        tasks = tasks.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            return 0;
        });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching tasks' });
    }
};

exports.getTodayTasksFormatted = async (req, res) => {
    try {
        await ensureTodaysTasks();

        const today = new Date();
        const startOfDay = new Date(today).setHours(0, 0, 0, 0);
        const endOfDay = new Date(today).setHours(23, 59, 59, 999);

        const tasks = await Cleaning.find({ date: { $gte: startOfDay, $lte: endOfDay } })
            .populate('assignedRoom', 'roomNumber');

        // Group by room
        const grouped = {};
        tasks.forEach(task => {
            if (!task.assignedRoom) return;
            const roomNum = task.assignedRoom.roomNumber;
            if (!grouped[roomNum]) {
                grouped[roomNum] = { room: roomNum, tasks: [] };
            }
            grouped[roomNum].tasks.push(task.area);
        });

        res.status(200).json(Object.values(grouped));
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching today tasks' });
    }
};

exports.getStudentCleaningTasks = async (req, res) => {
    try {
        await ensureTodaysTasks();

        const today = new Date();
        const startOfDay = new Date(today).setHours(0, 0, 0, 0);
        const endOfDay = new Date(today).setHours(23, 59, 59, 999);

        // Find student's active allocation to get their room
        const allocation = await Allocation.findOne({ studentId: req.user.id, status: 'active' });
        if (!allocation) {
            return res.status(200).json([]); // No active room, so no tasks
        }

        let tasks = await Cleaning.find({ 
            assignedRoom: allocation.roomId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching student tasks' });
    }
};

exports.updateCleaningStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Cleaning.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = 'completed';
        await task.save();
        res.status(200).json({ message: 'Task marked as Done', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating task status' });
    }
};
