const Booking = require('../models/Booking');
const Profile = require('../models/Profile');
const Registration = require('../models/Registration');
const User = require('../models/User');

/**
 * Handle new visitor booking creation.
 * Validates availability hours and student mapping for visits.
 */
exports.createBooking = async (req, res) => {
    try {
        const { visitorName, phone, NIC, type, studentId, date, time } = req.body;

        // Basic presence validation
        if (!visitorName || !phone || !NIC || !type || !date || !time) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Student-specific mapping check
        if (type === 'student_visit' && !studentId) {
            return res.status(400).json({ message: 'studentId is required for student_visit' });
        }

        // Format checks for security and data integrity
        if (!/^[0-9+ -]{9,15}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone format' });
        }
        if (NIC.length < 9) {
            return res.status(400).json({ message: 'Invalid NIC format' });
        }

        // Date restriction: No past booking scheduling
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        if (bookingDate < today) {
            return res.status(400).json({ message: 'Cannot book past dates' });
        }

        // Strict visiting window: 08:00 AM - 07:30 PM
        const [hours, minutes] = time.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        if (timeInMinutes < 480 || timeInMinutes > 1170) {
            return res.status(400).json({ message: 'Visiting hours are strictly between 08:00 AM and 07:30 PM.' });
        }

        // Link student name if it's a student visit
        let finalStudentName = 'Unknown Student';
        if (type === 'student_visit') {
            const [profile, reg, user] = await Promise.all([
                Profile.findOne({ user: studentId }).lean(),
                Registration.findById(studentId).lean(),
                User.findById(studentId).lean()
            ]);
            finalStudentName = reg?.fullName || profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Unknown Student';
        }

        const booking = await Booking.create({
            visitorName,
            phone,
            NIC,
            type,
            studentId: type === 'student_visit' ? studentId : undefined,
            studentName: finalStudentName,
            date: bookingDate,
            time
        });

        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Public lookup for visitors to see their specific booking status.
 * Requires Phone/NIC combination for access control.
 */
exports.getMyBookings = async (req, res) => {
    try {
        const { phone, NIC } = req.query;

        if (!phone || !NIC) {
            return res.status(400).json({ message: 'Phone and NIC pairs are required' });
        }

        const bookingsRaw = await Booking.find({ phone, NIC })
            .populate('studentId', 'email role')
            .sort({ date: -1, createdAt: -1 });

        // Enrich the results with student names from Profile model
        const bookings = await Promise.all(bookingsRaw.map(async (b) => {
            const bObj = b.toObject();
            if (bObj.type === 'student_visit' && bObj.studentId && (!bObj.studentName || bObj.studentName === 'Unknown Student')) {
                try {
                    const [profile, reg, user] = await Promise.all([
                        Profile.findOne({ user: bObj.studentId._id }).lean(),
                        Registration.findById(bObj.studentId._id).lean(),
                        User.findById(bObj.studentId._id).lean()
                    ]);
                    bObj.studentName = reg?.fullName || profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Unknown Student';
                } catch (innerErr) {
                    bObj.studentName = 'Unknown Student';
                }
            }
            return bObj;
        }));

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Get My Bookings Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Warden only: Retrieve every booking in the system.
 */
exports.getAllBookings = async (req, res) => {
    try {
        const bookingsRaw = await Booking.find()
            .populate('studentId', 'email role')
            .sort({ date: -1, createdAt: -1 });
        
        const bookings = await Promise.all(bookingsRaw.map(async (b) => {
            const bObj = b.toObject();
            if (bObj.type === 'student_visit' && bObj.studentId && (!bObj.studentName || bObj.studentName === 'Unknown Student')) {
                const [profile, reg, user] = await Promise.all([
                    Profile.findOne({ user: bObj.studentId._id }).lean(),
                    Registration.findById(bObj.studentId._id).lean(),
                    User.findById(bObj.studentId._id).lean()
                ]);
                bObj.studentName = reg?.fullName || profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Unknown Student';
            }
            return bObj;
        }));

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Warden only: Approve or Reject a visitor request.
 * Changes state seen by students and visitors.
 */
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = status;
        await booking.save();

        res.status(200).json({ message: `Booking ${status} successfully`, booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Student only: Get all visit requests where this student is the target.
 */
exports.getStudentBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ studentId: req.user.id, type: 'student_visit' })
            .sort({ date: -1, createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
