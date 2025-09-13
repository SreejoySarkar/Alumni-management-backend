const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');    // NEW
const groupRoutes = require('./routes/groups');  // NEW
const postRoutes = require('./routes/posts');    // NEW

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);   // NEW
app.use('/api/groups', groupRoutes); // NEW
app.use('/api/posts', postRoutes);   // NEW

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});