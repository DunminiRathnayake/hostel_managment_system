const Cleaning = require('../models/Cleaning');
const Allocation = require('../models/Allocation');

exports.createCleaningTask = async (req, res) => {
    try {
        const { area, assignedRoom, date, notes } = req.body;

        // Prevent past dates validation
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return res.status(400).json({ message: 'Cannot schedule cleaning for past dates.' });
        }

        // Prevent duplicate assignment: same area + same date
        const existingTask = await Cleaning.findOne({ area, date });
        if (existingTask) {
            return res.status(400).json({ message: 'This area is already assigned for cleaning on this date.' });
        }

        const newTask = new Cleaning({ area, assignedRoom, date, notes });
        await newTask.save();
        res.status(201).json({ message: 'Cleaning scheduled successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ message: 'Server error scheduling cleaning' });
    }
};

exports.getAllCleaningTasks = async (req, res) => {
    try {
        const tasks = await Cleaning.find().populate('assignedRoom', 'roomNumber type').sort({ date: 1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching tasks' });
    }
};

exports.getStudentCleaningTasks = async (req, res) => {
    try {
        // Find student's active allocation to get their room
        const allocation = await Allocation.findOne({ studentId: req.user.id, status: 'active' });
        if (!allocation) {
            return res.status(200).json([]); // No active room, so no tasks
        }

        const tasks = await Cleaning.find({ assignedRoom: allocation.roomId }).sort({ date: 1 });
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
