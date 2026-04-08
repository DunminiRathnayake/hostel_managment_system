const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    campus: { type: String, trim: true },
    studentPhone: { type: String, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    nicFrontImage: { type: String },
    nicBackImage: { type: String },
    qrToken: { type: String, unique: true, sparse: true },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
