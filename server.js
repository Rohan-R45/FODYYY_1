const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`   Origin: ${req.get('Origin') || 'No origin'}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5174', 
  'http://localhost:5175',
  'https://fodyyy.netlify.app',
  'https://fodyyy-1.onrender.com'
];

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fodyyy');
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Import routes with error handling
console.log('🔄 Loading routes...');

let authRoutes, restaurantRoutes, menuRoutes, orderRoutes;

try {
  console.log('📁 Loading auth routes...');
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Load users routes
let usersRoutes;
try {
  console.log('📁 Loading users routes...');
  usersRoutes = require('./routes/users');
  console.log('✅ Users routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load users routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Load restaurant routes
try {
  console.log('📁 Loading restaurant routes...');
  restaurantRoutes = require('./routes/restaurants');
  console.log('✅ Restaurant routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load restaurant routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Load menu routes
try {
  console.log('📁 Loading menu routes...');
  menuRoutes = require('./routes/menu');
  console.log('✅ Menu routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load menu routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Load order routes
try {
  console.log('📁 Loading order routes...');
  orderRoutes = require('./routes/orders');
  console.log('✅ Order routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load order routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('✅ All route files loaded successfully');

// Apply routes with logging
console.log('🔗 Mounting routes...');

app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 Auth route: ${req.method} ${req.path}`);
  next();
}, authRoutes);

app.use('/api/users', (req, res, next) => {
  console.log(`👤 Users route: ${req.method} ${req.path}`);
  next();
}, usersRoutes);

app.use('/api/restaurants', (req, res, next) => {
  console.log(`🏪 Restaurant route: ${req.method} ${req.path}`);
  next();
}, restaurantRoutes);

app.use('/api/menu', (req, res, next) => {
  console.log(`📋 Menu route: ${req.method} ${req.path}`);
  next();
}, menuRoutes);

app.use('/api/orders', (req, res, next) => {
  console.log(`📦 Order route: ${req.method} ${req.path}`);
  next();
}, orderRoutes);

console.log('✅ All routes mounted successfully');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to FODYYY API', 
    status: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
        test: 'GET /api/auth/test'
      },
      users: {
        profile: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        list: 'GET /api/users (admin only)'
      },
      restaurants: {
        list: 'GET /api/restaurants',
        test: 'GET /api/restaurants/test'
      },
      menu: {
        byRestaurant: 'GET /api/menu/restaurant/:restaurantId',
        test: 'GET /api/menu/test'
      },
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        test: 'GET /api/orders/test'
      }
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host || 'Not connected'
    }
  });
});

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

// Test auth route specifically
app.post('/api/test-login', (req, res) => {
  console.log('🧪 Test login route hit:', req.body);
  res.json({
    success: true,
    message: 'Test login route is working!',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);

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

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      auth: '/api/auth/login, /api/auth/register, /api/auth/me',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      orders: '/api/orders',
      test: '/api/test, /api/test-login'
    }
  });
});

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
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT}`);
  console.log(`📍 Server URL: http://${HOST}:${PORT}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`🗄️  MongoDB URI configured: ${process.env.MONGODB_URI ? 'Yes' : 'No'}`);
});

module.exports = app;