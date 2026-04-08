const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Profile = require('./models/Profile');
const Registration = require('./models/Registration');
const Login = require('./models/Login');
const Allocation = require('./models/Allocation');
const Booking = require('./models/Booking');
const CheckIn = require('./models/CheckIn');
const Cleaning = require('./models/Cleaning');
const Complaint = require('./models/Complaint');
const Notice = require('./models/Notice');
const Payment = require('./models/Payment');
const Room = require('./models/Room');

const models = { User, Profile, Registration, Login, Allocation, Booking, CheckIn, Cleaning, Complaint, Notice, Payment, Room };

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelDB')
    .then(async () => {
        console.log("Connected to MongoDB...");
        
        const exportDir = path.join(__dirname, 'db_exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }

        // Basic CSV Converter
        const toCSV = (data) => {
            if (!data || !data.length) return '';
            
            // Extract all unique headers across all documents to prevent missing columns
            const headerSet = new Set();
            data.forEach(row => Object.keys(row).forEach(k => headerSet.add(k)));
            const headers = Array.from(headerSet);

            const csvRows = [headers.join(',')];
            
            for (const row of data) {
                const values = headers.map(header => {
                    let val = row[header];
                    // Clean up embedded objects like ObjectIds or nested dicts
                    if (val !== null && typeof val === 'object') {
                        val = val.toString(); 
                    }
                    if (val === null || val === undefined) val = '';
                    
                    val = val.toString().replace(/"/g, '""');
                    // Quote strings that contain commas or newlines
                    if (val.search(/("|,|\n)/g) >= 0) {
                        val = `"${val}"`;
                    }
                    return val;
                });
                csvRows.push(values.join(','));
            }
            return csvRows.join('\n');
        };

        for (const [name, model] of Object.entries(models)) {
            try {
                const docs = await model.find({}).lean();
                if (docs.length > 0) {
                    const csvData = toCSV(docs);
                    fs.writeFileSync(path.join(exportDir, `${name}.csv`), csvData);
                    console.log(`Exported ${docs.length} records natively to ${name}.csv`);
                } else {
                    console.log(`Skipping ${name} (0 records detected)`);
                }
            } catch (err) {
                console.error(`Error processing ${name}: ${err.message}`);
            }
        }
        
        console.log(`\n✅ Database fully exported to: ${exportDir}`);
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("MongoDB Connection Fatal Error:", err);
        process.exit(1);
    });
