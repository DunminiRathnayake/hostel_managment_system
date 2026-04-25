require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dns = require('dns');

// Force reliable DNS servers for MongoDB Atlas SRV resolution
// (local ISP DNS may refuse SRV queries over TCP)
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const complaintRoutes = require('./routes/complaint');
const paymentRoutes = require('./routes/payment');
const bookingRoutes = require('./routes/booking');
const checkinRoutes = require('./routes/checkin');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');
const galleryRoutes = require('./routes/gallery');
const cleaningRoutes = require('./routes/cleaning');
const noticeRoutes = require('./routes/notices');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/cleaning', cleaningRoutes);
app.use('/api/notices', noticeRoutes);

// Setup static uploads hosting for receipt images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Hostel Management System API is running');
});

const PORT = process.env.PORT || 5000;

// ✅ CONNECT DB FIRST → THEN START SERVER
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
