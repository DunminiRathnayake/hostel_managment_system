const mongoose = require('mongoose');

const cleaningSchema = new mongoose.Schema({
    // Type distinguishes between a literal task or a repeating schedule mapping
    type: { type: String, enum: ['task', 'schedule'], default: 'task' },
    
    // For tasks
    area: {
        type: String,
        enum: ["Common Bathroom 1", "Common Bathroom 2", "Study Area", "Living Area", "Balcony", "Dining Area"]
    },
    date: { type: Date },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    
    // For schedule mapping (a specific day is assigned to a specific room)
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    
    // Universally required
    assignedRoom: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Cleaning', cleaningSchema);
