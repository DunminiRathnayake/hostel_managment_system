const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['warden', 'student'],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    loginHistory: [
        {
            loginTime: { type: Date, default: Date.now },
            ipAddress: { type: String }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
