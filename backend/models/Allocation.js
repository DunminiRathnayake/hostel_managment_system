const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    assignedDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'left'],
        default: 'active',
    }
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);
