const mongoose = require('mongoose');
const CheckIn = require('./models/CheckIn');
const Profile = require('./models/Profile');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/hostelDB').then(async () => {
    const recordsRaw = await CheckIn.find().sort({ checkInTime: -1 }).limit(1);
    const r = recordsRaw[0];
    const profile = await Profile.findOne({ user: r.studentId });
    fs.writeFileSync('out.json', JSON.stringify(profile, null, 2));
    process.exit(0);
});
