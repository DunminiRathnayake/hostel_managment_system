const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Registration = require('./models/Registration');

dotenv.config();

async function checkUser(email) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const userAccount = await User.findOne({ email: email.toLowerCase() });
        const registrationEntry = await Registration.findOne({ email: email.toLowerCase() });

        console.log("--- User Data for:", email, "---");
        if (userAccount) {
            console.log("Found in USER table:", {
                id: userAccount._id,
                role: userAccount.role,
                email: userAccount.email
            });
        } else {
            console.log("NOT found in USER table.");
        }

        if (registrationEntry) {
            console.log("Found in REGISTRATION table:", {
                id: registrationEntry._id,
                role: registrationEntry.role,
                email: registrationEntry.email,
                name: registrationEntry.fullName
            });
        } else {
            console.log("NOT found in REGISTRATION table.");
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser('dunminir@gmail.com');
