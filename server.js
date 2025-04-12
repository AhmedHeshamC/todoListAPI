require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, initDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const API_VERSION = '/api/v1'; // Define API version prefix

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(API_VERSION, limiter); // Apply general limiter to versioned routes

// Add stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

// Apply auth limiter to versioned /register and /login only
app.use(`${API_VERSION}/register`, authLimiter);
app.use(`${API_VERSION}/login`, authLimiter);

// Routes - Mount under API_VERSION
app.use(API_VERSION, authRoutes);
app.use(`${API_VERSION}/todos`, todoRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Could not connect to database. Exiting...');
      process.exit(1);
    }
    
    // Initialize database tables
    await initDatabase();
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; // Export for testing
