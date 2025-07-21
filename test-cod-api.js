const mongoose = require('mongoose');
const { User, Restaurant, MenuItem } = require('./models');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

async function testCODOrderAPI() {
  try {
    console.log('🧪 Testing COD Order via API...\n');

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

    // Create order data matching frontend structure
    const orderData = {
      restaurantId: restaurant._id.toString(),
      items: [{
        menuItemId: menuItem._id.toString(),
        quantity: 2,
        specialInstructions: 'Extra spicy please'
      }],
      deliveryAddress: 'Room 101, Hostel Block A, University Campus, Near Main Gate, Sangareddy, 502285',
      phoneNumber: '9876543210',
      paymentMethod: 'cod',
      specialInstructions: 'Please call before delivery'
    };

    console.log('📤 Sending order data:');
    console.log(JSON.stringify(orderData, null, 2));

    // Make API request with student auth
    try {
      // First, login as student to get token
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: student.email,
        password: 'password123'
      });

      const token = loginResponse.data.data.token;
      console.log('✅ Student logged in successfully');
      console.log('Token:', token ? 'Available' : 'Missing');

      // Make order request
      const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (orderResponse.data.success) {
        console.log('\n🎉 Order placed successfully!');
        console.log('Order Details:');
        console.log(`   Order ID: ${orderResponse.data.data._id}`);
        console.log(`   Order Number: ${orderResponse.data.data.orderNumber}`);
        console.log(`   Payment Method: ${orderResponse.data.data.paymentMethod}`);
        console.log(`   Total: ₹${orderResponse.data.data.totalAmount}`);
        console.log(`   Status: ${orderResponse.data.data.status}`);
        console.log(`   Payment Status: ${orderResponse.data.data.paymentStatus}`);
        
        console.log('\n✅ COD order creation is working!');
      } else {
        console.log('❌ Order creation failed:', orderResponse.data.message);
      }

    } catch (error) {
      console.log('❌ API request failed!');
      
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
        
        if (error.response.data.errors) {
          console.log('\nValidation Errors:');
          error.response.data.errors.forEach(err => {
            console.log(`   ${err.field}: ${err.message}`);
          });
        }
      } else {
        console.log('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCODOrderAPI();