require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const fs = require('fs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const profiles = await Profile.find({});
    fs.writeFileSync('db_profiles_dump.json', JSON.stringify(profiles, null, 2));
    console.log('Saved to db_profiles_dump.json');
    process.exit(0);
});
