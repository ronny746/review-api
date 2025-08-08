// app.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// load .env before anything that uses env vars
dotenv.config();

// connect to DB (connectDB should handle its own errors/logging)
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// serve public static files
app.use(express.static(path.join(__dirname, 'public')));

// route to serve review page (nice URL)
app.get('/review/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'review.html'));
});

// API routes
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const referralRoutes = require('./routes/referralRoutes');
const businessRoutes = require('./routes/businessRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/business', businessRoutes);

// optional: health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
