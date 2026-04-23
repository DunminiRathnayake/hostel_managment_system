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

    // Check which areas already have tasks for today
    const existingTasks = await Cleaning.find({ type: 'task', date: { $gte: startOfDay, $lte: endOfDay } });
    const coveredAreas = new Set(existingTasks.map(t => t.area));
    
    // We only need to generate tasks for areas that aren't already covered
    const missingAreas = CLEANING_AREAS.filter(area => !coveredAreas.has(area));
    if (missingAreas.length === 0) return; // All 6 areas are covered

    // Determine today's name
    const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = DAYS_MAP[today.getDay()];

    // Get assigned rooms for today from Cleaning
    const scheduleRecords = await Cleaning.find({ type: 'schedule', day: todayName });
    if (!scheduleRecords || scheduleRecords.length === 0) return; // No rooms assigned to clean today

    const groupRooms = scheduleRecords.map(s => s.assignedRoom).filter(Boolean);
    if (groupRooms.length === 0) return;

    // Distribute ALL areas to the combined rooms
    const newTasks = [];
    const combinedRoomsStr = groupRooms.join(', ');
    
    missingAreas.forEach((area) => {
        newTasks.push({
            type: 'task',
            area,
            assignedRoom: combinedRoomsStr,
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
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        let tasks = await Cleaning.find({ type: 'task', date: { $gte: startOfDay, $lte: endOfDay } })
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
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const tasks = await Cleaning.find({ type: 'task', date: { $gte: startOfDay, $lte: endOfDay } });

        // Group by room string
        const grouped = {};
        tasks.forEach(task => {
            if (!task.assignedRoom) return;
            const roomStr = task.assignedRoom; // "room 101"
            if (!grouped[roomStr]) {
                grouped[roomStr] = { room: roomStr, tasks: [] };
            }
            grouped[roomStr].tasks.push(task.area);
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
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Find student's active allocation to get their room
        const allocation = await Allocation.findOne({ studentId: req.user.id, status: 'active' })
            .populate('roomId', 'roomNumber');
            
        if (!allocation || !allocation.roomId) {
            return res.status(200).json([]); // No active room, so no tasks
        }

        let tasks = await Cleaning.find({ 
            type: 'task',
            assignedRoom: { $regex: new RegExp(`\\broom ${allocation.roomId.roomNumber}\\b`, 'i') },
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

exports.getCleaningSchedule = async (req, res) => {
    try {
        const records = await Cleaning.find({ type: 'schedule' });
        
        const grouped = {};
        const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        DAYS.forEach(d => grouped[d] = { day: d, rooms: [] });

        records.forEach(r => {
            if (r.assignedRoom) {
                const num = r.assignedRoom.replace(/^room\s+/i, '');
                grouped[r.day].rooms.push({ roomNumber: num });
            }
        });

        res.status(200).json(Object.values(grouped));
    } catch(err) {
        res.status(500).json({ message: 'Error fetching schedule' });
    }
};

exports.updateCleaningSchedule = async (req, res) => {
    try {
        const { day, rooms } = req.body;
        
        await Cleaning.deleteMany({ type: 'schedule', day });
        
        const validRooms = rooms.filter(Boolean);
        const newEntries = validRooms.map(roomNum => ({
            type: 'schedule',
            day,
            assignedRoom: `room ${roomNum}`
        }));

        if (newEntries.length > 0) {
            await Cleaning.insertMany(newEntries);
        }

        // If updating today's schedule, wipe pending tasks for today so they regenerate
        const today = new Date();
        const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (day === DAYS_MAP[today.getDay()]) {
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            
            await Cleaning.deleteMany({ 
                type: 'task', 
                status: 'pending', 
                date: { $gte: startOfDay, $lte: endOfDay } 
            });
        }

        res.status(200).json({ message: 'Schedule updated' });
    } catch(err) {
        res.status(500).json({ message: 'Error updating schedule' });
    }
};
