const mongoose = require('mongoose');

const cleaningSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true,
        enum: ["Common Bathroom 1", "Common Bathroom 2", "Study Area", "Living Area", "Balcony", "Dining Area"]
    },
    assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Cleaning', cleaningSchema);
