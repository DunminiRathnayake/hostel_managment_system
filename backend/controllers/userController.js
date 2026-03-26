const User = require('../models/User');
const qrcode = require('qrcode');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Target user identity isolated.' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Fetch Profile logic blocked', error);
        res.status(500).json({ message: 'Internal logic crash fetching native profile configurations.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, campus, parentName, parentPhone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User context isolated securely.' });

        // Dynamic assignment mapped optionally based purely on frontend JSON triggers
        if (name) user.name = name;
        if (campus) user.campus = campus;
        if (parentName) user.parentName = parentName;
        if (parentPhone) user.parentPhone = parentPhone;

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error('Profile Updates Offline', error);
        res.status(500).json({ message: 'Native server routing execution failure mapped internally.' });
    }
};

exports.getStudentsList = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name _id');
        res.status(200).json(students);
    } catch (error) {
        console.error('Fetch Students error', error);
        res.status(500).json({ message: 'Error retrieving hostel directory.' });
    }
};

exports.getMyQR = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Backward compatibility for existing users without qrToken
        let token = user.qrToken;
        if (!token) {
            token = crypto.randomBytes(32).toString('hex');
            user.qrToken = token;
            await user.save();
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
