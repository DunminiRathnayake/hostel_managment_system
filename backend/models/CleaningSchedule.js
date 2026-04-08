const mongoose = require('mongoose');

const CleaningScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        unique: true
    },
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }]
}, { timestamps: true });

module.exports = mongoose.model('CleaningSchedule', CleaningScheduleSchema);
