const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function cleanTestData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const User = require('../models/User');
        const Registration = require('../models/Registration');
        const Room = require('../models/Room');
        const Booking = require('../models/Booking');
        const Payment = require('../models/Payment');
        const Complaint = require('../models/Complaint');
        
        // Delete all test data
        await User.deleteMany({ email: { $regex: /test_student_/ } });
        await Registration.deleteMany({ email: { $regex: /test_student_/ } });
        await Room.deleteMany({ roomNumber: { $regex: /TEST-/ } });
        await Booking.deleteMany({ visitorName: 'John Doe' });
        await Booking.deleteMany({ visitorName: 'John' });
        await Payment.deleteMany({ amount: 1000, category: 'key_money' });
        await Complaint.deleteMany({ title: 'Broken Window' });
        
        console.log('✅ Cleaned up all automated test garbage from database');
    } catch (err) {
        console.error('❌ Failed to clean up test data:', err);
    } finally {
        await mongoose.connection.close();
    }
}

// Run directly if called from command line
if (require.main === module) {
    cleanTestData().then(() => process.exit(0));
}

module.exports = cleanTestData;
