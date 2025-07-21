const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Import configuration and utilities
const config = require('./config');
const logger = require('./utils/logger');

const app = express();

// Trust proxy for production deployments
if (config.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.isProduction() ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware for production
if (config.isProduction()) {
  app.use(compression());
}

// Request logging
app.use(logger.requestLogger());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Speed limiting for auth routes
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5, // allow 5 requests per windowMs without delay
  delayMs: 500 // add 500ms delay per request after delayAfter
});

app.use('/api/auth/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// MongoDB connection with improved error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    
    logger.info('MongoDB connected successfully', {
      host: conn.connection.host,
      database: conn.connection.name,
      port: conn.connection.port,
      environment: config.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(`   Error: ${error.message}`);
    
    // Provide helpful error messages based on error type
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   • Make sure MongoDB is running locally, OR');
      console.log('   • Update MONGODB_URI in .env to use MongoDB Atlas');
      console.log('   • Check your network connection');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication issue:');
      console.log('   • Check your MongoDB Atlas username and password');
      console.log('   • Ensure your IP is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('bad auth')) {
      console.log('\n💡 Authentication issue:');
      console.log('   • Verify your MongoDB Atlas credentials');
      console.log('   • Check if your database user has proper permissions');
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 Exiting in production mode due to database connection failure');
      process.exit(1);
    } else {
      console.log('🔄 Continuing in development mode without database...');
      console.log('   Some features may not work properly without database connection\n');
    }
  }
};

// Initialize database connection
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('connected', async () => {
  console.log('🔗 Mongoose connected to MongoDB');
  
  // Initialize database models
  try {
    const { initializeDatabase } = require('./models');
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Failed to initialize database models:', error.message);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Import routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FODYYY API', status: 'Server is running!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database statistics route
app.get('/api/stats', async (req, res) => {
  try {
    const { getModelStats } = require('./models');
    const stats = await getModelStats();
    
    if (stats) {
      res.json({
        success: true,
        message: 'Database statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve database statistics'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving database statistics',
      error: error.message
    });
  }
});

// ===== TEMPORARY TEST ROUTE - REMOVE AFTER TESTING =====
// Minimal login route for quick testing
app.post('/api/test/login', (req, res) => {
  console.log('🧪 TEST LOGIN ROUTE HIT!');
  console.log('   Request body:', req.body);
  console.log('   Request headers:', req.headers);
  console.log('   Timestamp:', new Date().toISOString());
  
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    console.log('❌ Validation failed - missing email or password');
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required',
      received: { email: !!email, password: !!password }
    });
  }
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Validation failed - invalid email format');
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format',
      email: email
    });
  }
  
  console.log('✅ Test login validation passed');
  
  // For now, just return success to test the route
  res.json({ 
    success: true, 
    message: 'TEST: Login route is working perfectly!',
    data: {
      email: email,
      timestamp: new Date().toISOString(),
      note: 'This is a test route - replace with real auth later'
    }
  });
});

// Alternative test route with different path
app.post('/api/auth/test-login', (req, res) => {
  console.log('🧪 ALTERNATIVE TEST LOGIN ROUTE HIT!');
  console.log('   This route bypasses the auth routes middleware');
  console.log('   Request body:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password required' 
    });
  }
  
  res.json({ 
    success: true, 
    message: 'Alternative test login route working',
    email: email,
    route: '/api/auth/test-login'
  });
});
// ===== END TEMPORARY TEST ROUTES =====

// 404 handler for undefined routes (must come after all other routes)
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware (must be last)
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Use error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;