const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    campus: { type: String, trim: true },
    studentPhone: { type: String, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    nicFrontImage: { type: String },
    nicBackImage: { type: String },
    qrToken: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['approved', 'pending'], default: 'approved' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
