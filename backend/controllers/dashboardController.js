const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.getWardenOverview = async (req, res) => {
    try {
        const [
            totalStudents,
            totalRooms,
            pendingComplaints,
            pendingPayments,
            pendingBookings
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Room.countDocuments(),
            Complaint.countDocuments({ status: 'pending' }),
            Payment.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'pending' })
        ]);

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
