const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/hostelDB').then(async () => {
  const db = mongoose.connection.db;
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  await db.collection('users').updateOne(
    { email: 'nimal@test.com' },
    { $set: { password: hashedPassword } }
  );
  
  await db.collection('users').updateOne(
    { email: 'dunminir@gmail.com' },
    { $set: { password: hashedPassword } }
  );

  console.log('Passwords updated successfully to "password123"');
  process.exit(0);
}).catch(console.error);
