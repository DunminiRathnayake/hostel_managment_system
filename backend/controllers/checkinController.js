const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Registration = require('../models/Registration');
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

        // Try finding student in Registration first (most common for new students)
        let studentProfile = await Registration.findOne({ qrToken }).lean();
        let studentName = "";
        let studentId = "";

        if (studentProfile) {
            studentName = studentProfile.fullName;
            studentId = studentProfile._id;
        } else {
            // Fallback to legacy Profile collection
            const profile = await Profile.findOne({ qrToken }).lean();
            if (!profile) {
                console.log(`❌ QR SCAN FAILED: Token '${qrToken}' mismatch!`);
                return res.status(401).json({ message: 'Invalid or unrecognized secure QR code' });
            }
            studentName = profile.fullName || profile.name;
            studentId = profile.user;
        }

        // Locate the absolute most recent activity node
        const latestRecord = await CheckIn.findOne({ studentId }).sort({ checkInTime: -1 });
        const now = new Date();

        // Cooldown Protection
        if (latestRecord) {
            const lastActivity = latestRecord.checkOutTime || latestRecord.checkInTime;
            if (lastActivity && now.getTime() - lastActivity.getTime() < 60000) {
                return res.status(400).json({ message: 'Please wait before scanning again' });
            }
        }

        const today = new Date(now.getTime());
        today.setHours(0, 0, 0, 0);

        // CheckOut Handler
        if (latestRecord && !latestRecord.checkOutTime) {
            const sessionDurationMs = now.getTime() - new Date(latestRecord.checkInTime).getTime();
            const SIXTEEN_HOURS = 16 * 60 * 60 * 1000;

            if (sessionDurationMs < SIXTEEN_HOURS) {
                const lateHour = parseInt(process.env.LATE_HOUR || '20', 10);
                const isLateCheckOut = now.getHours() >= lateHour || now.getHours() < 6;

                latestRecord.checkOutTime = now;
                latestRecord.isLateCheckOut = isLateCheckOut;
                if (isLateCheckOut) latestRecord.isLate = true; // Ensure visibility in Late Reports

                await latestRecord.save();
                return res.status(200).json({ message: 'Check-out successful', record: latestRecord, studentName });
            }
        }

        // CheckIn Handler
        const lateHour = parseInt(process.env.LATE_HOUR || '20', 10);
        const isLate = now.getHours() >= lateHour || now.getHours() < 6;

        const newCheckIn = await CheckIn.create({
            studentId,
            checkInTime: now,
            date: today,
            isLate
        });

        return res.status(201).json({ message: 'Check-in successful', record: newCheckIn, studentName });

    } catch (error) {
        console.error('Scan QR Controller Error:', error);
        res.status(500).json({ message: 'Server error parsing scanning sequence' });
    }
};

exports.getAllRecords = async (req, res) => {
    try {
        const recordsRaw = await CheckIn.find().sort({ checkInTime: -1 }).limit(100);
        const records = await Promise.all(recordsRaw.map(async r => {
            const [profile, reg] = await Promise.all([
                Profile.findOne({ user: r.studentId }).lean(),
                Registration.findById(r.studentId).lean()
            ]);
            
            const doc = r.toObject();
            const name = reg?.fullName || profile?.fullName || profile?.name || "Unknown Student";
            doc.studentName = name; // Add studentName flat to avoid nested populate crashes
            return doc;
        }));
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching records' });
    }
};

exports.getLateStudents = async (req, res) => {
    try {
        const lateRecordsRaw = await CheckIn.find({ isLate: true }).sort({ date: -1 });
        const lateRecords = await Promise.all(lateRecordsRaw.map(async r => {
            const [profile, reg] = await Promise.all([
                Profile.findOne({ user: r.studentId }).lean(),
                Registration.findById(r.studentId).lean()
            ]);
            const doc = r.toObject();
            doc.studentName = reg?.fullName || profile?.fullName || profile?.name || "Unknown Student";
            return doc;
        }));
        res.status(200).json(lateRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching late students' });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const records = await CheckIn.aggregate([
            { $match: { isLate: true } },
            { $group: { _id: '$studentId', lateCount: { $sum: 1 } } },
            { $sort: { lateCount: -1 } }
        ]);

        const report = await Promise.all(records.map(async item => {
            const [profile, reg, user] = await Promise.all([
                Profile.findOne({ user: item._id }).lean(),
                Registration.findById(item._id).lean(),
                User.findById(item._id).lean()
            ]);

            return {
                _id: item._id,
                lateCount: item.lateCount,
                student: {
                    name: reg?.fullName || profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Unknown',
                    email: reg?.email || user?.email || 'N/A'
                }
            };
        }));

        res.status(200).json(report);
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ message: 'Server error generating report' });
    }
};

exports.getMyCheckIns = async (req, res) => {
    try {
        const records = await CheckIn.find({ studentId: req.user.id }).sort({ checkInTime: -1 }).limit(50);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error reading check-ins' });
    }
};
