const Payment = require('../models/Payment');

exports.submitPayment = async (req, res) => {
    try {
        const { amount, category, description, paymentType } = req.body;
        
        // 1. Validate Core Fields
        if (!amount || !category || !paymentType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // 2. Additional description dependency
        if (category === 'other' && !description) {
            return res.status(400).json({ message: 'Description is required for category "other"' });
        }

        // 3. File capture validations
        if (!req.file) {
            return res.status(400).json({ message: 'Payment slip image is required' });
        }

        // 4. Save and return pending operation
        const payment = await Payment.create({
            studentId: req.user.id,
            amount,
            category,
            description,
            paymentType,
            slipImage: `/uploads/payments/${req.file.filename}`
        });

        res.status(201).json({ message: 'Payment submitted successfully', payment });
    } catch (error) {
        console.error('Submit Payment Error:', error);
        res.status(500).json({ message: 'Server error while submitting payment' });
    }
};

exports.getMyPayments = async (req, res) => {
    try {
        // Find exclusively local to the injected JWT user token
        const payments = await Payment.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Get My Payments Error:', error);
        res.status(500).json({ message: 'Server error while retrieving payments' });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        // Used by warden -> inject student reference
        const payments = await Payment.find()
            .populate('studentId', 'name email role')
            .sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Get All Payments Error:', error);
        res.status(500).json({ message: 'Server error while retrieving all payments' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update string' });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment target not found' });
        }

        payment.status = status;
        await payment.save();

        res.status(200).json({ message: `Payment ${status} successfully`, payment });
    } catch (error) {
        console.error('Update Payment Status Error:', error);
        res.status(500).json({ message: 'Server error while updating payment status' });
    }
};
