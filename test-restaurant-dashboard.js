const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testRestaurantDashboard() {
  console.log('🧪 Testing Restaurant Dashboard Data\n');

  try {
    // Connect to MongoDB to check data directly
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { Restaurant, Order, User } = require('./models');

    // Step 1: Check if there are any restaurants and orders
    console.log('\n1️⃣ Checking database state...');
    const restaurants = await Restaurant.find({}).populate('ownerId', 'name email');
    const orders = await Order.find({}).populate('restaurantId', 'name').populate('studentId', 'name');
    
    console.log(`   📊 Total restaurants: ${restaurants.length}`);
    console.log(`   📊 Total orders: ${orders.length}`);
    
    if (restaurants.length > 0) {
      console.log('\n   🏪 Restaurants:');
      restaurants.forEach((restaurant, index) => {
        console.log(`      ${index + 1}. ${restaurant.name} (Owner: ${restaurant.ownerId?.email || 'Unknown'})`);
      });
    }
    
    if (orders.length > 0) {
      console.log('\n   📋 Orders:');
      orders.forEach((order, index) => {
        console.log(`      ${index + 1}. Order #${order.orderNumber || order._id.toString().slice(-6)}`);
        console.log(`         Restaurant: ${order.restaurantId?.name || 'Unknown'}`);
        console.log(`         Student: ${order.studentId?.name || 'Unknown'}`);
        console.log(`         Status: ${order.status}`);
        console.log(`         Amount: ₹${order.totalAmount}`);
        console.log(`         Date: ${order.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n   ⚠️ No orders found in database!');
      console.log('   💡 This explains why dashboard shows 0 for all metrics.');
    }

    // Step 2: Test dashboard API for each restaurant
    console.log('\n2️⃣ Testing dashboard API for each restaurant...');
    
    for (const restaurant of restaurants) {
      console.log(`\n   🏪 Testing dashboard for: ${restaurant.name}`);
      console.log(`      Owner: ${restaurant.ownerId?.email}`);
      
      // We need to authenticate as the restaurant owner to test the dashboard API
      // For now, let's just test the endpoint structure
      
      // Check orders for this specific restaurant
      const restaurantOrders = orders.filter(order => 
        order.restaurantId && order.restaurantId._id.toString() === restaurant._id.toString()
      );
      
      console.log(`      📊 Orders for this restaurant: ${restaurantOrders.length}`);
      
      if (restaurantOrders.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = restaurantOrders.filter(order => 
          new Date(order.createdAt) >= today
        );
        
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        const statusCounts = restaurantOrders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`      📊 Today's orders: ${todayOrders.length}`);
        console.log(`      💰 Today's revenue: ₹${todayRevenue}`);
        console.log(`      📈 Status breakdown:`, statusCounts);
        
        const pendingCount = (statusCounts.pending || 0) + 
                           (statusCounts.confirmed || 0) + 
                           (statusCounts.preparing || 0) + 
                           (statusCounts.ready || 0);
        const completedCount = statusCounts.delivered || 0;
        
        console.log(`      ⏳ Pending orders: ${pendingCount}`);
        console.log(`      ✅ Completed orders: ${completedCount}`);
      }
    }

    // Step 3: Create test data if no orders exist
    if (orders.length === 0 && restaurants.length > 0) {
      console.log('\n3️⃣ Creating test orders for demonstration...');
      
      // Find a student user to create orders
      const students = await User.find({ role: 'student' });
      if (students.length > 0) {
        const testRestaurant = restaurants[0];
        const testStudent = students[0];
        
        console.log(`   Creating test orders for ${testRestaurant.name}...`);
        
        // Create a few test orders with different statuses
        const testOrders = [
          {
            restaurantId: testRestaurant._id,
            studentId: testStudent._id,
            items: [{
              name: 'Test Item 1',
              price: 150,
              quantity: 2
            }],
            totalAmount: 300,
            status: 'delivered',
            orderNumber: 'TEST001',
            createdAt: new Date()
          },
          {
            restaurantId: testRestaurant._id,
            studentId: testStudent._id,
            items: [{
              name: 'Test Item 2',
              price: 200,
              quantity: 1
            }],
            totalAmount: 200,
            status: 'pending',
            orderNumber: 'TEST002',
            createdAt: new Date()
          },
          {
            restaurantId: testRestaurant._id,
            studentId: testStudent._id,
            items: [{
              name: 'Test Item 3',
              price: 100,
              quantity: 3
            }],
            totalAmount: 300,
            status: 'preparing',
            orderNumber: 'TEST003',
            createdAt: new Date()
          }
        ];
        
        for (const orderData of testOrders) {
          try {
            const newOrder = new Order(orderData);
            await newOrder.save();
            console.log(`   ✅ Created test order: ${orderData.orderNumber} (${orderData.status})`);
          } catch (error) {
            console.log(`   ❌ Failed to create test order: ${error.message}`);
          }
        }
        
        console.log('\n   🎉 Test orders created! Dashboard should now show data.');
        console.log('   💡 Refresh your restaurant dashboard to see the updated metrics.');
      } else {
        console.log('   ⚠️ No student users found to create test orders');
      }
    }

    // Step 4: Test the actual API endpoint (requires authentication)
    console.log('\n4️⃣ API endpoint information...');
    console.log('   📍 Dashboard stats endpoint: GET /api/orders/stats/dashboard');
    console.log('   🔐 Requires authentication as restaurant owner');
    console.log('   📊 Returns: overall, today, thisWeek, thisMonth, statusBreakdown, recentOrders');
    console.log('\n   💡 To test with authentication:');
    console.log('   1. Login as a restaurant owner in the frontend');
    console.log('   2. Check browser network tab for the API call');
    console.log('   3. Copy the Authorization header');
    console.log('   4. Use it in a manual API test');

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    if (orders.length === 0) {
      console.log('   🚨 ROOT CAUSE: No orders in database');
      console.log('   💡 SOLUTION: Create some test orders or place real orders');
      console.log('   ✅ Dashboard will show real-time data once orders exist');
    } else {
      console.log('   ✅ Orders exist in database');
      console.log('   🔍 Check if frontend is correctly mapping backend data');
      console.log('   🔍 Verify authentication is working for dashboard API');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testRestaurantDashboard();
}

module.exports = { testRestaurantDashboard };