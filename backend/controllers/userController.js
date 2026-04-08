const User = require('../models/User');
const Profile = require('../models/Profile');
const Registration = require('../models/Registration');
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
        let userProfile = await Registration.findById(req.user.id).select('-password');
        
        if (!userProfile) {
            // Fallback for Wardens / Legacy users
            const user = await User.findById(req.user.id).select('-password');
            if (!user) return res.status(404).json({ message: 'Target user identity isolated.' });
            
            const profile = await Profile.findOne({ user: req.user.id });
            const mergedData = { ...user.toObject() };
            if (profile) Object.assign(mergedData, profile.toObject());
            return res.status(200).json(mergedData);
        }
        
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Fetch Profile logic blocked', error);
        res.status(500).json({ message: 'Internal logic crash fetching native profile configurations.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, campus, emergencyContactName, emergencyPhone, studentPhone } = req.body;
        
        let reg = await Registration.findById(req.user.id);
        
        if (reg) {
            if (fullName) reg.fullName = fullName;
            if (campus) reg.campus = campus;
            if (emergencyContactName) reg.emergencyContactName = emergencyContactName;
            if (emergencyPhone) reg.emergencyPhone = emergencyPhone;
            if (studentPhone) reg.studentPhone = studentPhone;

            if (req.files) {
                if (req.files.nicFront) reg.nicFrontImage = `/uploads/profiles/${req.files.nicFront[0].filename}`;
                if (req.files.nicBack) reg.nicBackImage = `/uploads/profiles/${req.files.nicBack[0].filename}`;
            }

            await reg.save();
            return res.status(200).json(reg);
        }

        // Fallback to legacy Profile for wardens
        const { name, parentName, parentPhone } = req.body;
        let profile = await Profile.findOne({ user: req.user.id });

        if (!profile) profile = new Profile({ user: req.user.id });

        if (name || fullName) profile.fullName = name || fullName;
        if (campus) profile.campus = campus;
        if (parentName || emergencyContactName) profile.emergencyContactName = parentName || emergencyContactName;
        if (parentPhone || emergencyPhone) profile.emergencyPhone = parentPhone || emergencyPhone;
        if (studentPhone) profile.studentPhone = studentPhone;

        if (req.files) {
            if (req.files.nicFront) profile.nicFront = `/uploads/profiles/${req.files.nicFront[0].filename}`;
            if (req.files.nicBack) profile.nicBack = `/uploads/profiles/${req.files.nicBack[0].filename}`;
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
        
        // Fetch all potential student sources
        const [usersRaw, registrations, allocations] = await Promise.all([
            User.find({ role: 'student' }).select('-password'),
            Registration.find(),
            Allocation.find({ status: 'active' }).populate('roomId')
        ]);

        let mappedStudents = [];
        const processedEmails = new Set();

        // 1. Process Registrations (Primary source for new students)
        for (const reg of registrations) {
            const alloc = allocations.find(a => a.studentId.toString() === reg._id.toString());
            mappedStudents.push({
                _id: reg._id,
                name: reg.fullName,
                email: reg.email,
                campus: reg.campus,
                studentPhone: reg.studentPhone,
                parentName: reg.emergencyContactName,
                parentPhone: reg.emergencyPhone,
                assignedRoom: alloc ? alloc.roomId.roomNumber : 'Unassigned',
                status: reg.isActive === false ? 'inactive' : 'active'
            });
            processedEmails.add(reg.email.toLowerCase());
        }

        // 2. Process legacy User collection (Wardens or old students)
        for (const s of usersRaw) {
            if (processedEmails.has(s.email.toLowerCase())) continue;

            const profile = await Profile.findOne({ user: s._id });
            const alloc = allocations.find(a => a.studentId.toString() === s._id.toString());
            
            // Safely extract name from Profile and fallback to Email Username if missing
            const emailName = s.email.split('@')[0];
            const cleanEmailName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            
            mappedStudents.push({
                _id: s._id,
                name: profile?.fullName || cleanEmailName,
                email: s.email,
                campus: profile?.campus || 'N/A',
                studentPhone: profile?.studentPhone || 'N/A',
                parentName: profile?.emergencyContactName || 'N/A',
                parentPhone: profile?.emergencyPhone || 'N/A',
                assignedRoom: alloc ? alloc.roomId.roomNumber : 'Unassigned',
                status: s.isActive === false ? 'inactive' : 'active'
            });
        }
        
        if (unassigned === 'true') {
            mappedStudents = mappedStudents.filter(s => s.assignedRoom === 'Unassigned');
        }
        
        res.status(200).json(mappedStudents);
    } catch (error) {
        console.error('Fetch Students consolidated error', error);
        res.status(500).json({ message: 'Error retrieving consolidated hostel directory.' });
    }
};

exports.getMyQR = async (req, res) => {
    try {
        let token;
        
        // Try Registration first (modern student login)
        const registration = await Registration.findById(req.user.id);
        if (registration) {
            token = registration.qrToken;
            if (!token) {
                token = crypto.randomBytes(32).toString('hex');
                registration.qrToken = token;
                await registration.save();
            }
        } else {
            // Fallback for legacy Users
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            
            let profile = await Profile.findOne({ user: req.user.id });
            if (!profile) {
                profile = new Profile({ user: req.user.id, name: 'Student' });
            }

            token = profile.qrToken;
            if (!token) {
                token = crypto.randomBytes(32).toString('hex');
                profile.qrToken = token;
                await profile.save();
            }
        }

        const jwtToken = jwt.sign(
            { qrToken: token },
            process.env.JWT_SECRET,
            { expiresIn: '60s' }
        );

        const payload = JSON.stringify({ token: jwtToken });
        const qrDataUrl = await qrcode.toDataURL(payload);

        res.status(200).json({ qrImage: qrDataUrl, token: jwtToken });
    } catch (error) {
        console.error('QR Generate Error:', error);
        res.status(500).json({ message: 'Failed to generate secure QR code' });
    }
};

exports.deactivateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // 1. Deactivate User/Registration
        let deactivated = false;
        const reg = await Registration.findById(studentId);
        if (reg) {
            reg.isActive = false;
            await reg.save();
            deactivated = true;
        }

        const user = await User.findById(studentId);
        if (user) {
            user.isActive = false;
            await user.save();
            deactivated = true;
        }

        if (!deactivated) {
            return res.status(404).json({ message: "Student not found" });
        }

        // 2. Remove Room Assignment & Decrement Room Occupancy
        const allocation = await Allocation.findOne({ studentId, status: 'active' }).populate('roomId');
        if (allocation && allocation.roomId) {
            allocation.status = 'left';
            await allocation.save();

            const Room = require('../models/Room');
            const room = await Room.findById(allocation.roomId._id);
            if (room) {
                room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
                if (room.currentOccupancy < room.capacity) {
                    room.status = 'available';
                }
                await room.save();
            }
        }

        res.status(200).json({ message: "Student successfully deactivated and removed from room" });
    } catch (error) {
        console.error('Deactivate Student Error:', error);
        res.status(500).json({ message: 'Internal server error during deactivation' });
    }
};
