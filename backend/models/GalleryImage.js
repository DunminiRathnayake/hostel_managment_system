const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
