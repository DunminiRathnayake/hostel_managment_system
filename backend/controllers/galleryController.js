const GalleryImage = require('../models/GalleryImage');
const path = require('path');
const fs = require('fs');

exports.getImages = async (req, res) => {
    try {
        const images = await GalleryImage.find().sort('-createdAt');
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching images' });
    }
};

exports.addImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        const { title } = req.body;
        if (!title) {
            // Unlink if title is missing
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Title is required' });
        }

        // Save the relative URL so the frontend can display it
        const url = `/uploads/gallery/${req.file.filename}`;

        const newImage = new GalleryImage({ title, url });
        await newImage.save();

        res.status(201).json(newImage);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error adding image' });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        // Delete the file from local storage
        const filePath = path.join(__dirname, '../', image.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await image.deleteOne();
        res.status(200).json({ message: 'Image deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error deleting image' });
    }
};
