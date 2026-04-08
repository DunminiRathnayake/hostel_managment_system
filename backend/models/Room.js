const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    currentOccupancy: {
        type: Number,
        default: 0,
        min: 0,
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'booked'],
        default: 'available',
    },
    features: [{
        type: String,
    }],
    group: {
        type: Number,
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
