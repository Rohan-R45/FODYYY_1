// Minimal server to test auth routes
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
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

console.log('📁 Loading auth routes...');
try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded successfully');
  
  // Mount auth routes
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted at /api/auth');
  
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Minimal FODYYY API Server', status: 'running' });
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`\n🚀 Minimal server running on port ${PORT}`);
  console.log(`   Test login: http://localhost:${PORT}/api/auth/login`);
  
  // Test the login route
  setTimeout(async () => {
    console.log('\n🧪 Testing login route...');
    try {
      const axios = require('axios');
      const response = await axios.post(`http://localhost:${PORT}/api/auth/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('✅ Login route accessible (unexpected success)');
      console.log('   Response:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('✅ Login route accessible!');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        if (error.response.status === 400 || error.response.status === 401) {
          console.log('   This is expected - route is working but credentials are invalid');
        }
      } else {
        console.log('❌ Login route not accessible:', error.message);
      }
    }
  }, 2000);
});