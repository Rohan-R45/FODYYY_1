// Debug server startup
console.log('🚀 Starting debug server...');

try {
  // Load environment variables
  require('dotenv').config();
  console.log('✅ Environment variables loaded');
  
  // Test Express
  const express = require('express');
  const app = express();
  console.log('✅ Express loaded');
  
  // Test middleware
  const cors = require('cors');
  console.log('✅ CORS loaded');
  
  // Test MongoDB
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded');
  
  // Add basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  console.log('✅ Basic middleware added');
  
  // Add CORS
  app.use(cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  console.log('✅ CORS configured');
  
  // Test routes loading
  console.log('📁 Loading routes...');
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
  
  const restaurantRoutes = require('./routes/restaurants');
  console.log('✅ Restaurant routes loaded');
  
  const menuRoutes = require('./routes/menu');
  console.log('✅ Menu routes loaded');
  
  const orderRoutes = require('./routes/orders');
  console.log('✅ Order routes loaded');
  
  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  console.log('✅ Routes mounted');
  
  // Add basic route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to FODYYY API', status: 'Server is running!' });
  });
  console.log('✅ Basic route added');
  
  // Test route listing
  console.log('\n📋 Registered routes:');
  app._router.stack.forEach((middleware, index) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      console.log(`   ${index + 1}. ${methods.join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`   ${index + 1}. Router: ${middleware.regexp}`);
      if (middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((layer, subIndex) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods);
            console.log(`      ${subIndex + 1}. ${methods.join(', ').toUpperCase()} ${layer.route.path}`);
          }
        });
      }
    }
  });
  
  // Add 404 handler
  app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
  });
  
  // Add error handler
  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });
  console.log('✅ Error handlers added');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`\n🎉 Debug server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Test URL: http://localhost:${PORT}/api/auth/login`);
  });
  
  // Test the route after server starts
  setTimeout(async () => {
    console.log('\n🧪 Testing login route...');
    try {
      const axios = require('axios');
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('✅ Route accessible (expected auth error)');
    } catch (error) {
      if (error.response) {
        console.log('✅ Route accessible, got response:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Route not accessible:', error.message);
      }
    }
  }, 2000);
  
} catch (error) {
  console.error('❌ Server startup error:', error.message);
  console.error('Stack trace:', error.stack);
}