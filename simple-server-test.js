// Simple server test to isolate the issue
const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Test if we can create a simple auth route
const router = express.Router();

router.post('/login', (req, res) => {
  console.log('🔐 Simple login route hit!');
  res.json({
    success: true,
    message: 'Simple login route working',
    body: req.body
  });
});

// Mount the router
app.use('/api/auth', router);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Simple test server running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = 5001; // Use different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`🧪 Simple test server running on port ${PORT}`);
  console.log(`   Test login: http://localhost:${PORT}/api/auth/login`);
  
  // Test the route
  setTimeout(async () => {
    try {
      const axios = require('axios');
      const response = await axios.post(`http://localhost:${PORT}/api/auth/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('✅ Simple login route test successful!');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Simple login route test failed:', error.message);
    }
  }, 1000);
});