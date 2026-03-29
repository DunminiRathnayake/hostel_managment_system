const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    campus: { type: String, trim: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    studentPhone: { type: String, trim: true },
    nicFront: { type: String },
    nicBack: { type: String },
    qrToken: { type: String, unique: true, sparse: true },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
