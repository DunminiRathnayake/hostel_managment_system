const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function listWardens() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const wardens = await User.find({ role: 'warden' });
        console.log("--- Current Wardens ---");
        wardens.forEach(w => console.log(w.email));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

listWardens();
