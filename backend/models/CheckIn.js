const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    date: {
        type: Date,
        required: true
    },
    isLate: {
        type: Boolean,
        default: false
    },
    isLateCheckOut: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
