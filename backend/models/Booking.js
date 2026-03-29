const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    visitorName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    NIC: { type: String, required: true, trim: true },
    type: { type: String, enum: ['student_visit', 'room_visit'], required: true },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: function() { return this.type === 'student_visit'; }
    },
    studentName: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
