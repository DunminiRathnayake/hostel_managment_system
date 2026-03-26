const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.scanQR = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Secure QR Token required from scan' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired QR code. Please refresh.' });
        }

        const qrToken = decoded.qrToken;
        if (!qrToken) return res.status(401).json({ message: 'Invalid QR format.' });

        // Find user exclusively by their secure non-guessable token natively
        const student = await User.findOne({ qrToken });

        if (!student || student.role !== 'student') {
            return res.status(401).json({ message: 'Invalid or unrecognized secure QR code' });
        }

        const studentId = student._id;

        // Locate the absolute most recent activity node, ignoring the clock entirely solving midnight thresholds natively
        const latestRecord = await CheckIn.findOne({ studentId }).sort({ checkInTime: -1 });

        const now = new Date();

        // Cooldown Protection
        if (latestRecord) {
            const lastActivity = latestRecord.checkOutTime || latestRecord.checkInTime;
            if (lastActivity && now.getTime() - lastActivity.getTime() < 60000) {
                return res.status(400).json({ message: 'Please wait before scanning again' });
            }
        }

        // CheckOut Handler: Student has an open session tracking currently null
        if (latestRecord && !latestRecord.checkOutTime) {
            latestRecord.checkOutTime = now;
            await latestRecord.save();

            console.log(`✅ Check-out success for student: ${student.email} at ${now.toISOString()}`);
            return res.status(200).json({ message: 'Check-out successful', record: latestRecord, studentName: student.name });
        }

        // CheckIn Handler: Setup completely fresh logic parameters
        const today = new Date(now.getTime());
        today.setHours(0, 0, 0, 0); // Normalized cleanly resolving local time daylight mapping bugs

        const lateHour = parseInt(process.env.LATE_HOUR || '20', 10);
        const currentHour = now.getHours();
        const isLate = currentHour >= lateHour;

        const newCheckIn = await CheckIn.create({
            studentId,
            checkInTime: now,
            date: today,
            isLate
        });

        console.log(`✅ Check-in success for student: ${student.email} at ${now.toISOString()}`);
        if (isLate) {
            console.log(`⚠️ Late check-in detected for student: ${student.email}`);
        }

        return res.status(201).json({ message: 'Check-in successful', record: newCheckIn, studentName: student.name });

    } catch (error) {
        console.error('Scan QR Controller Logic Error:', error);
        res.status(500).json({ message: 'Server error parsing scanning sequence internally' });
    }
};

exports.getAllRecords = async (req, res) => {
    try {
        const records = await CheckIn.find().populate('studentId', 'name email').sort({ date: -1, checkInTime: -1 }).limit(100);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching records' });
    }
};

exports.getLateStudents = async (req, res) => {
    try {
        const lateRecords = await CheckIn.find({ isLate: true }).populate('studentId', 'name email').sort({ date: -1 });
        res.status(200).json(lateRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching late students' });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const report = await CheckIn.aggregate([
            { $match: { isLate: true } },
            { $group: { _id: '$studentId', lateCount: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
            { $unwind: '$student' },
            { $project: { _id: 1, lateCount: 1, 'student.name': 1, 'student.email': 1 } },
            { $sort: { lateCount: -1 } }
        ]);

        res.status(200).json(report);
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ message: 'Server error generating report' });
    }
};

exports.getMyCheckIns = async (req, res) => {
    try {
        const records = await CheckIn.find({ studentId: req.user.id }).sort({ date: -1, checkInTime: -1 }).limit(50);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Internal server logic crash reading arrays internally' });
    }
};
