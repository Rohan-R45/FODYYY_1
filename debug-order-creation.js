const axios = require('axios');
const mongoose = require('mongoose');
const { User, Restaurant, MenuItem } = require('./models');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function debugOrderCreation() {
  try {
    console.log('🔍 Debugging Order Creation Issue...\n');

    // Connect to database to get test data
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get test data
    const student = await User.findOne({ role: 'student' });
    const restaurant = await Restaurant.findOne({ isActive: true });
    const menuItem = await MenuItem.findOne({ restaurantId: restaurant._id });

    if (!student || !restaurant || !menuItem) {
      console.log('❌ Missing test data');
      return;
    }

    console.log(`👤 Student: ${student.name} (${student.email})`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`🍽️  Menu Item: ${menuItem.name} - ₹${menuItem.price}\n`);

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated authentication token\n');

    // Test COD order creation exactly as frontend would send
    console.log('📱 Testing COD Order Creation (simulating frontend request)...');
    
    const orderData = {
      restaurantId: restaurant._id.toString(),
      items: [{
        menuItemId: menuItem._id.toString(),
        quantity: 2,
        specialInstructions: 'Extra spicy please'
      }],
      deliveryAddress: 'Room 101, Hostel Block A, University Campus, Near Main Gate',
      phoneNumber: '9876543210',
      paymentMethod: 'cod', // This is what frontend sends
      specialInstructions: 'Please call before delivery'
    };

    console.log('📤 Sending order data:');
    console.log(JSON.stringify(orderData, null, 2));

    try {
      const response = await axios.post(`${BASE_URL}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('\n✅ COD Order created successfully!');
      console.log('📋 Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.log('\n❌ COD Order creation failed!');
      
      if (error.response) {
        console.log(`🔴 Status: ${error.response.status}`);
        console.log(`🔴 Status Text: ${error.response.statusText}`);
        console.log('🔴 Error Response:', JSON.stringify(error.response.data, null, 2));
        
        // Check for validation errors
        if (error.response.data.errors) {
          console.log('\n📝 Validation Errors:');
          error.response.data.errors.forEach((err, index) => {
            console.log(`   ${index + 1}. Field: ${err.field} - ${err.message}`);
          });
        }
      } else if (error.request) {
        console.log('🔴 No response received from server');
        console.log('🔴 Request details:', error.request);
      } else {
        console.log('🔴 Error setting up request:', error.message);
      }
    }

    // Test with different variations
    console.log('\n🔄 Testing different payment method variations...');
    
    const variations = [
      { method: 'COD', description: 'Uppercase COD' },
      { method: 'Cash', description: 'Cash' },
      { method: 'cash', description: 'Lowercase cash' }
    ];

    for (const variation of variations) {
      console.log(`\n📱 Testing ${variation.description}...`);
      
      const testData = {
        ...orderData,
        paymentMethod: variation.method,
        phoneNumber: `987654321${Math.floor(Math.random() * 10)}` // Unique phone
      };

      try {
        const response = await axios.post(`${BASE_URL}/orders`, testData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        console.log(`✅ ${variation.description} order created successfully!`);
        console.log(`   Order ID: ${response.data.data._id}`);
        console.log(`   Payment Method: ${response.data.data.paymentMethod}`);

      } catch (error) {
        console.log(`❌ ${variation.description} order failed:`);
        if (error.response) {
          console.log(`   Status: ${error.response.status} - ${error.response.data.message}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Check if server is running first
const checkServerAndRun = async () => {
  try {
    console.log('🔍 Checking if server is running...');
    // Try multiple endpoints to check server
    try {
      await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    } catch (e1) {
      try {
        await axios.get(`http://localhost:5000/`, { timeout: 3000 });
      } catch (e2) {
        throw new Error('Server not responding');
      }
    }
    console.log('✅ Server is running\n');
    await debugOrderCreation();
  } catch (error) {
    console.log('❌ Server is not running or not responding');
    console.log('Please start the server first with: npm start');
    console.log('Then run this debug script again.');
    console.log('Error details:', error.message);
  }
};

checkServerAndRun();