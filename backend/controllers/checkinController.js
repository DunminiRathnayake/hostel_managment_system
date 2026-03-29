const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const Profile = require('../models/Profile');
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

        const profile = await Profile.findOne({ qrToken });
        if (!profile) {
            console.log(`❌ QR SCAN FAILED: Token '${qrToken}' not found cleanly in purely Profile Collections!`);
            return res.status(401).json({ message: 'Invalid or unrecognized secure QR code' });
        }

        const student = await User.findById(profile.user);
        if (!student || student.role !== 'student') {
            console.log(`❌ QR SCAN FAILED: Bound Identity is null or missing 'student' role. Profile: ${profile.user}, Role: ${student ? student.role : 'NOT_FOUND'}`);
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

        const today = new Date(now.getTime());
        today.setHours(0, 0, 0, 0);

        // CheckOut Handler: Student has an open session tracking currently null
        if (latestRecord && !latestRecord.checkOutTime) {
            // Safety Timeout: If the open session started over 16 hours ago, they likely missed a scan. 
            // We forcefully abandon the old checkout to cleanly prevent permanent logic flip-flop.
            const sessionDurationMs = now.getTime() - new Date(latestRecord.checkInTime).getTime();
            const SIXTEEN_HOURS = 16 * 60 * 60 * 1000;

            if (sessionDurationMs < SIXTEEN_HOURS) {
                latestRecord.checkOutTime = now;
                await latestRecord.save();

                console.log(`✅ Check-out success for student: ${student.email} at ${now.toISOString()}`);
                return res.status(200).json({ message: 'Check-out successful', record: latestRecord, studentName: profile.name });
            } else {
                console.log(`⚠️ Expired open session detected for ${student.email}. Abandoning checkout, creating fresh check-in.`);
            }
        }

        // CheckIn Handler: Setup completely fresh logic parameters
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

        return res.status(201).json({ message: 'Check-in successful', record: newCheckIn, studentName: profile.name });

    } catch (error) {
        console.error('Scan QR Controller Logic Error:', error);
        res.status(500).json({ message: 'Server error parsing scanning sequence internally' });
    }
};

exports.getAllRecords = async (req, res) => {
    try {
        const recordsRaw = await CheckIn.find().populate('studentId', 'email').sort({ date: -1, checkInTime: -1 }).limit(100);
        const records = await Promise.all(recordsRaw.map(async r => {
            const profile = await Profile.findOne({ user: r.studentId?._id });
            const doc = r.toObject();
            if (doc.studentId) doc.studentId.name = profile ? profile.name : "External Entity";
            return doc;
        }));
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching records' });
    }
};

exports.getLateStudents = async (req, res) => {
    try {
        const lateRecordsRaw = await CheckIn.find({ isLate: true }).populate('studentId', 'email').sort({ date: -1 });
        const lateRecords = await Promise.all(lateRecordsRaw.map(async r => {
            const profile = await Profile.findOne({ user: r.studentId?._id });
            const doc = r.toObject();
            if (doc.studentId) doc.studentId.name = profile ? profile.name : "External Entity";
            return doc;
        }));
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
            { $lookup: { from: 'profiles', localField: '_id', foreignField: 'user', as: 'profileData' } },
            { $unwind: '$student' },
            { $unwind: { path: '$profileData', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 1, lateCount: 1, 'student.name': { $ifNull: ['$profileData.name', 'Legacy Student'] }, 'student.email': 1 } },
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
