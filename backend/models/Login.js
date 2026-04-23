const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Login', loginSchema);
