const mongoose = require('mongoose');
const { User, Restaurant, MenuItem } = require('./models');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

async function testFrontendOrderFlow() {
  try {
    console.log('🧪 Testing Frontend Order Flow...\n');

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

    // Test both UPI and COD orders
    const testCases = [
      {
        name: 'COD Order',
        paymentMethod: 'cod'
      },
      {
        name: 'UPI Order', 
        paymentMethod: 'upi'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔄 Testing ${testCase.name}...`);
      
      // Create order data exactly like frontend sends
      const deliveryAddress = {
        street: 'Room 101, Hostel Block A',
        landmark: 'Main Gate',
        city: 'Sangareddy',
        pincode: '502285',
        instructions: 'Please call before delivery'
      };

      // Format address like frontend does
      const formattedAddress = [
        deliveryAddress.street,
        deliveryAddress.landmark && `Near ${deliveryAddress.landmark}`,
        deliveryAddress.city,
        deliveryAddress.pincode
      ].filter(Boolean).join(', ');

      const orderData = {
        restaurantId: restaurant._id.toString(),
        items: [{
          menuItemId: menuItem._id.toString(),
          quantity: 2,
          specialInstructions: 'Extra spicy please'
        }],
        deliveryAddress: formattedAddress,
        phoneNumber: '9876543210',
        paymentMethod: testCase.paymentMethod,
        specialInstructions: deliveryAddress.instructions || ''
      };

      try {
        // Login as student
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: student.email,
          password: 'password123'
        });

        const token = loginResponse.data.data.token;

        // Make order request
        const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (orderResponse.data.success) {
          console.log(`✅ ${testCase.name} successful!`);
          console.log(`   Order ID: ${orderResponse.data.data._id}`);
          console.log(`   Payment Method: ${orderResponse.data.data.paymentMethod}`);
          console.log(`   Status: ${orderResponse.data.data.status}`);
        } else {
          console.log(`❌ ${testCase.name} failed:`, orderResponse.data.message);
        }

      } catch (error) {
        console.log(`❌ ${testCase.name} API request failed!`);
        
        if (error.response) {
          console.log('   Status:', error.response.status);
          console.log('   Error:', error.response.data.message || error.response.data);
          
          if (error.response.data.errors) {
            console.log('   Validation Errors:');
            error.response.data.errors.forEach(err => {
              console.log(`     ${err.field}: ${err.message}`);
            });
          }
        } else {
          console.log('   Error:', error.message);
        }
      }
    }

    console.log('\n🔍 Testing validation errors...');
    
    // Test with invalid data to see validation
    const invalidOrderData = {
      restaurantId: restaurant._id.toString(),
      items: [], // Empty items - should fail
      deliveryAddress: 'Test', // Too short - should fail
      phoneNumber: '123', // Invalid phone - should fail
      paymentMethod: 'invalid', // Invalid payment method - should fail
      specialInstructions: ''
    };

    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: student.email,
        password: 'password123'
      });

      const token = loginResponse.data.data.token;

      const response = await axios.post('http://localhost:5000/api/orders', invalidOrderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('❌ Validation test failed - should have been rejected');
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation working correctly');
        console.log('   Validation errors:', error.response.data.message);
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => {
            console.log(`     ${err.field}: ${err.message}`);
          });
        }
      } else {
        console.log('❌ Unexpected validation error:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFrontendOrderFlow();