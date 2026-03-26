const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { visitorName, phone, NIC, type, studentId, date, time } = req.body;

        if (!visitorName || !phone || !NIC || !type || !date || !time) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (type === 'student_visit' && !studentId) {
            return res.status(400).json({ message: 'studentId is required for student_visit' });
        }

        // Validate basic formats loosely to ensure string safety
        if (!/^[0-9+ -]{9,15}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone format (must be standard phone characters)' });
        }
        if (NIC.length < 9) {
            return res.status(400).json({ message: 'Invalid NIC format (length must be at least 9)' });
        }

        // Prevent past dates from being explicitly scheduled
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset clock to exactly midnight for pure daylight bounding comparison
        if (bookingDate < today) {
            return res.status(400).json({ message: 'Cannot book past dates' });
        }

        const booking = await Booking.create({
            visitorName,
            phone,
            NIC,
            type,
            studentId: type === 'student_visit' ? studentId : undefined,
            date: bookingDate,
            time
        });

        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ message: 'Server error while creating booking' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        // External visitor fetches own payload using query strings exclusively
        const { phone, NIC } = req.query;

        if (!phone || !NIC) {
            return res.status(400).json({ message: 'Phone and NIC exact match pairs are required to retrieve native bookings securely' });
        }

        const bookings = await Booking.find({ phone, NIC })
            .populate('studentId', 'name email role')
            .sort({ date: -1, createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Get My Bookings Error:', error);
        res.status(500).json({ message: 'Server error while retrieving bookings' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('studentId', 'name email role')
            .sort({ date: -1, createdAt: -1 });
        
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({ message: 'Server error while retrieving all bookings' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update string' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({ message: `Booking ${status} successfully`, booking });
    } catch (error) {
        console.error('Update Booking Status Error:', error);
        res.status(500).json({ message: 'Server error while updating booking status' });
    }
};
