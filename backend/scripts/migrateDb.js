const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('🟢 Connected to MongoDB. Starting Data Migration...');
        
        // Use raw MongoDB collection bindings to bypass strict Mongoose schemas
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const profilesCollection = db.collection('profiles');

        // Fetch all legacy users
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`Found ${allUsers.length} total users to process.`);

        let profilesCreated = 0;
        let usersCleaned = 0;

        for (const userDoc of allUsers) {
            // 1. Move Profile Data 
            const existingProfile = await profilesCollection.findOne({ user: userDoc._id });
            
            if (!existingProfile) {
                const newProfile = {
                    user: userDoc._id,
                    name: userDoc.name || 'Unknown Reference',
                    status: userDoc.status || 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                if (userDoc.campus) newProfile.campus = userDoc.campus;
                if (userDoc.parentName) newProfile.parentName = userDoc.parentName;
                if (userDoc.parentPhone) newProfile.parentPhone = userDoc.parentPhone;
                if (userDoc.studentPhone) newProfile.studentPhone = userDoc.studentPhone;
                if (userDoc.nicFront) newProfile.nicFront = userDoc.nicFront;
                if (userDoc.nicBack) newProfile.nicBack = userDoc.nicBack;
                if (userDoc.qrToken) newProfile.qrToken = userDoc.qrToken;

                await profilesCollection.insertOne(newProfile);
                profilesCreated++;
                console.log(`✅ Created Profile mapping for: ${userDoc.email}`);
            }

            // 2. Erase legacy data from User (Normalization)
            const result = await usersCollection.updateOne(
                { _id: userDoc._id },
                {
                    $unset: {
                        name: "",
                        campus: "",
                        parentName: "",
                        parentPhone: "",
                        studentPhone: "",
                        nicFront: "",
                        nicBack: "",
                        qrToken: "",
                        status: ""
                    }
                }
            );
            
            if (result.modifiedCount > 0) {
                usersCleaned++;
            }
        }

        console.log('----------------------------------------------------');
        console.log(`🚀 Migration Complete:`);
        console.log(`- ${profilesCreated} brand new Profile documents spawned.`);
        console.log(`- ${usersCleaned} legacy User accounts permanently sanitized.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration crashed natively:', err);
        process.exit(1);
    });
