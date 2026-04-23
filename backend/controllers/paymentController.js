const Payment = require('../models/Payment');
const User = require('../models/User');
const Profile = require('../models/Profile');

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

        // 4. Look up student profile strictly to burn the exact name natively into the DB
        const Registration = require('../models/Registration'); // Import Registration
        
        let finalStudentName = 'Unknown Student';
        const profile = await Profile.findOne({ user: req.user.id }).lean();
        if (profile && (profile.name || profile.fullName)) {
            finalStudentName = profile.fullName || profile.name;
        } else {
            const reg = await Registration.findById(req.user.id).lean();
            if (reg && reg.fullName) {
                finalStudentName = reg.fullName;
            } else {
                const userObj = await User.findById(req.user.id).lean();
                if (userObj && userObj.email) finalStudentName = userObj.email.split('@')[0];
            }
        }

        // 5. Save and return pending operation
        const payment = await Payment.create({
            studentId: req.user.id,
            studentName: finalStudentName,
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
        // 1. Fetch all payments sorted by newest date first
        const allPayments = await Payment.find().sort({ createdAt: -1 });

        // 2. Prioritize "pending" payments at the top of the array
        const sorted = [
            ...allPayments.filter(p => p.status === 'pending'),
            ...allPayments.filter(p => p.status !== 'pending')
        ];

        res.status(200).json(sorted);
    } catch (error) {
        console.error('CRITICAL: Get All Payments Error:', error);
        res.status(500).json({ message: 'Error retrieving payment data' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['approved', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // Apply the status update
        payment.status = status;
        await payment.save();

        console.log(`✅ Payment ${req.params.id} updated to ${status}`);
        res.status(200).json({ message: `Success: Payment ${status}`, payment });
    } catch (error) {
        console.error('CRITICAL: Update Payment Status Error:', error);
        res.status(500).json({ message: 'Server error during status update' });
    }
};
