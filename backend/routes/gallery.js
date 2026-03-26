const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getImages, addImage, deleteImage } = require('../controllers/galleryController');

// Public route for viewing gallery
router.get('/', getImages);

// Warden only routes for adding and deleting
router.post('/', protect, authorize('warden'), (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, addImage);

router.delete('/:id', protect, authorize('warden'), deleteImage);

module.exports = router;
