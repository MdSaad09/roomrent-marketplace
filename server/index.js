const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const propertyRoutes = require('./routes/property.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const uploadRoutes = require('./routes/upload.routes.js');
const imageRoutes = require('./routes/image.routes.js');
const agentRoutes = require('./routes/agent.routes');
const { ensurePropertyImageUrls } = require('./middleware/image.middleware');
const inquiryRoutes = require('./routes/inquiry.routes.js');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(ensurePropertyImageUrls);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - IMPORTANT: These must come before the catch-all route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Serve static files from dist folder (React build)
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

// Catch-all for React frontend - IMPORTANT: This must come after API routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Export for Vercel serverless functions
module.exports = app;
