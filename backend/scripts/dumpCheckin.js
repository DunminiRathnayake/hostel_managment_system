require('dotenv').config();
const mongoose = require('mongoose');
const CheckIn = require('./models/CheckIn');
const fs = require('fs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const checks = await CheckIn.find().sort({ createdAt: -1 });
    fs.writeFileSync('db_checkins_dump.json', JSON.stringify(checks, null, 2));
    console.log('Saved to db_checkins_dump.json');
    process.exit(0);
});
