const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function makeWarden(email) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateOne({ email }, { role: 'warden' });
        console.log(`Updated ${result.modifiedCount} user to Warden role.`);
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

makeWarden('dunminir@gmail.com');
