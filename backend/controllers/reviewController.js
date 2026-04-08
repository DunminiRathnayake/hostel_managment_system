const Review = require('../models/Review');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Profile = require('../models/Profile');

exports.addOrUpdateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be specifically between 1 and 5' });
        }
        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'A comment must be provided' });
        }

        // Fetch user name dynamically across the hybrid DB layout
        let studentName = "Student";
        const reg = await Registration.findById(req.user.id);
        if (reg) {
            studentName = reg.fullName;
        } else {
            const profile = await Profile.findOne({ user: req.user.id });
            if (profile) studentName = profile.fullName || profile.name;
        }

        // Check if review already exists
        let review = await Review.findOne({ user: req.user.id });

        if (review) {
            review.rating = rating;
            review.comment = comment.trim();
            review.studentName = studentName;
            await review.save();
            return res.status(200).json({ message: 'Review successfully updated', review });
        }

        review = await Review.create({
            user: req.user.id,
            studentName,
            rating,
            comment: comment.trim()
        });

        res.status(201).json({ message: 'Review successfully submitted', review });
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({ message: 'Server error processing the review request: ' + error.message });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ message: 'Error fetching review system data' });
    }
};

exports.getAverageRating = async (req, res) => {
    try {
        const reviews = await Review.find();
        if (reviews.length === 0) {
            return res.status(200).json({ average: 0, total: 0 });
        }
        
        const sum = reviews.reduce((acc, current) => acc + current.rating, 0);
        const average = (sum / reviews.length).toFixed(1);

        res.status(200).json({ average, total: reviews.length });
    } catch (error) {
        console.error('Get Average Rating Error:', error);
        res.status(500).json({ message: 'Error fetching average rating' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Review successfully removed by administrator' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ message: 'Error deleting the review record' });
    }
};
