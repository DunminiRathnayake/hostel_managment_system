const Complaint = require('../models/Complaint');
const Allocation = require('../models/Allocation');
const Profile = require('../models/Profile');
const Registration = require('../models/Registration');
const User = require('../models/User');

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private/Student
exports.createComplaint = async (req, res) => {
    try {
        const { title, description } = req.body;
        const studentId = req.user.id; // User must be authenticated

        if (!title || !description) {
            return res.status(400).json({ message: 'Please provide title and description' });
        }

        // Attempt to automatically attach room allocated to student if they have an active one
        const activeAllocation = await Allocation.findOne({ studentId, status: 'active' });
        const roomId = activeAllocation ? activeAllocation.roomId : null;

        const newComplaint = new Complaint({
            studentId,
            roomId,
            title,
            description,
        });

        await newComplaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/complaints/my-complaints
// @desc    Get user's own complaints
// @access  Private
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ studentId: req.user.id })
            .populate('roomId', 'roomNumber type')
            .sort({ createdAt: -1 });

        res.status(200).json({ complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/complaints
// @desc    Get all complaints (for warden)
// @access  Private/Warden
exports.getAllComplaints = async (req, res) => {
    try {
        const complaintsRaw = await Complaint.find({})
            .populate('roomId', 'roomNumber')
            .sort({ createdAt: -1 });

        const complaints = await Promise.all(complaintsRaw.map(async (c) => {
            const cObj = c.toObject();
            const studentId = cObj.studentId;

            const [profile, reg, user] = await Promise.all([
                Profile.findOne({ user: studentId }).lean(),
                Registration.findById(studentId).lean(),
                User.findById(studentId).lean()
            ]);

            const resolvedName = reg?.fullName || profile?.fullName || profile?.name || "Unknown Student";
            const resolvedEmail = reg?.email || user?.email || "Unknown Email";

            cObj.studentId = {
                _id: studentId,
                name: resolvedName,
                email: resolvedEmail
            };

            return cObj;
        }));

        res.status(200).json({ complaints });
    } catch (error) {
        console.error('Error fetching all complaints:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private/Warden
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaintId = req.params.id;

        if (!['pending', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status;
        await complaint.save();

        res.status(200).json({ message: 'Complaint status updated', complaint });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   DELETE /api/complaints/:id
// @desc    Delete a complaint completely
// @access  Private/Warden
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint document not found' });
        }
        res.status(200).json({ message: 'Complaint successfully permanently purged' });
    } catch (error) {
        console.error('Error deleting complaint document:', error);
        res.status(500).json({ message: 'Internal logic crash deleting structural element' });
    }
};
