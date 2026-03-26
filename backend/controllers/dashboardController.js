const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.getWardenOverview = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalRooms = await Room.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });

        res.status(200).json({
            totalStudents,
            totalRooms,
            pendingComplaints,
            pendingPayments,
            pendingBookings
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error aggregating warden statistics' });
    }
};
