require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
   const profiles = await Profile.find();
   console.log("------------ PROFILES ------------");
   for (let p of profiles) {
       console.log(`User: ${p.user} | Name: ${p.name} | qrToken: ${p.qrToken}`);
       const u = await User.findById(p.user);
       console.log(`  -> User Schema Role: ${u ? u.role : 'NOT FOUND'}`);
   }
   console.log("----------------------------------");
   process.exit(0);
});
