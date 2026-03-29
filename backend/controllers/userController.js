const User = require('../models/User');
const Profile = require('../models/Profile');
const Allocation = require('../models/Allocation');
const qrcode = require('qrcode');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.getMyRoom = async (req, res) => {
    try {
        const allocation = await Allocation.findOne({ studentId: req.user.id, status: 'active' }).populate('roomId');
        if (!allocation || !allocation.roomId) {
            return res.status(200).json({ roomNumber: 'Pending Approval', roomType: 'Pending' });
        }
        res.status(200).json({ roomNumber: allocation.roomId.roomNumber, roomType: allocation.roomId.type });
    } catch (error) {
        console.error('Fetch My Room Error:', error);
        res.status(500).json({ message: 'Internal server error while retrieving room data' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const profile = await Profile.findOne({ user: req.user.id });
        if (!user) return res.status(404).json({ message: 'Target user identity isolated.' });
        
        const mergedData = { ...user.toObject() };
        if (profile) {
            Object.assign(mergedData, profile.toObject());
        }
        
        res.status(200).json(mergedData);
    } catch (error) {
        console.error('Fetch Profile logic blocked', error);
        res.status(500).json({ message: 'Internal logic crash fetching native profile configurations.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, campus, parentName, parentPhone, studentPhone } = req.body;
        let profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
             profile = new Profile({ user: req.user.id });
        }

        if (name) profile.name = name;
        if (campus) profile.campus = campus;
        if (parentName) profile.parentName = parentName;
        if (parentPhone) profile.parentPhone = parentPhone;
        if (studentPhone) profile.studentPhone = studentPhone;

        if (req.files) {
            if (req.files.nicFront) {
                profile.nicFront = `/uploads/profiles/${req.files.nicFront[0].filename}`;
            }
            if (req.files.nicBack) {
                profile.nicBack = `/uploads/profiles/${req.files.nicBack[0].filename}`;
            }
        }

        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        console.error('Profile Updates Offline', error);
        res.status(500).json({ message: 'Native server routing execution failure mapped internally.' });
    }
};

exports.getStudentsList = async (req, res) => {
    try {
        const { unassigned } = req.query;
        
        const studentsRaw = await User.find({ role: 'student' }).select('-password');
        let mappedStudents = [];
        
        const allocations = await Allocation.find({ status: 'active' }).populate('roomId');
        
        for (const s of studentsRaw) {
            const profile = await Profile.findOne({ user: s._id });
            const alloc = allocations.find(a => a.studentId.toString() === s._id.toString());
            
            if (profile) {
                mappedStudents.push({
                    _id: s._id,
                    name: profile.name,
                    email: s.email,
                    campus: profile.campus,
                    studentPhone: profile.studentPhone,
                    parentName: profile.parentName,
                    parentPhone: profile.parentPhone,
                    assignedRoom: alloc ? alloc.roomId.roomNumber : 'Unassigned',
                    status: profile.status
                });
            } else {
                mappedStudents.push({
                    _id: s._id,
                    name: 'Profile Incomplete',
                    email: s.email,
                    assignedRoom: alloc ? alloc.roomId.roomNumber : 'Unassigned',
                    status: 'inactive'
                });
            }
        }
        
        if (unassigned === 'true') {
            mappedStudents = mappedStudents.filter(s => s.assignedRoom === 'Unassigned');
        }
        
        res.status(200).json(mappedStudents);
    } catch (error) {
        console.error('Fetch Students error', error);
        res.status(500).json({ message: 'Error retrieving hostel directory.' });
    }
};

exports.getMyQR = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id, name: 'Student' });
        }

        let token = profile.qrToken;
        if (!token) {
            token = crypto.randomBytes(32).toString('hex');
            profile.qrToken = token;
            await profile.save();
        }

        const jwtToken = jwt.sign(
            { qrToken: token },
            process.env.JWT_SECRET,
            { expiresIn: '60s' }
        );

        const payload = JSON.stringify({ token: jwtToken });
        const qrDataUrl = await qrcode.toDataURL(payload);

        res.status(200).json({ qrImage: qrDataUrl });
    } catch (error) {
        console.error('QR Generate Error:', error);
        res.status(500).json({ message: 'Failed to generate secure QR code' });
    }
};
