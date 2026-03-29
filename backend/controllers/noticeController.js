const Notice = require('../models/Notice');

exports.createNotice = async (req, res) => {
    try {
        const { message, type } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Broadcast message is perfectly required' });
        }

        // Deactivate all previous notices so only one active global announcement exists strictly
        await Notice.updateMany({}, { active: false });
        
        const newNotice = await Notice.create({ message, type: type || 'info', active: true });
        res.status(201).json({ message: 'Broadcast successful!', notice: newNotice });
    } catch (error) {
        console.error('Error broadcasting notice:', error);
        res.status(500).json({ message: 'Server error scheduling broadcast' });
    }
};

exports.getActiveNotice = async (req, res) => {
    try {
        const notice = await Notice.findOne({ active: true }).sort({ createdAt: -1 });
        res.status(200).json(notice || null);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching active bounds' });
    }
};

exports.clearNotice = async (req, res) => {
    try {
        await Notice.updateMany({}, { active: false });
        res.status(200).json({ message: 'Broadcast cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error clearing boundaries' });
    }
};
