const mongoose = require('mongoose');
require('dotenv').config();

async function createTestOrders() {
  console.log('🧪 Creating Test Orders for Today\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { Restaurant, Order, User } = require('./models');

    // Find restaurants and students
    const restaurants = await Restaurant.find({}).populate('ownerId', 'email');
    const students = await User.find({ role: 'student' });

    if (restaurants.length === 0) {
      console.log('❌ No restaurants found');
      return;
    }

    if (students.length === 0) {
      console.log('❌ No students found');
      return;
    }

    console.log(`📊 Found ${restaurants.length} restaurants and ${students.length} students`);

    // Create test orders for today for a few restaurants
    const testRestaurants = restaurants.slice(0, 3); // Test with first 3 restaurants
    const testStudent = students[0];

    console.log('\n🏪 Creating test orders for:');
    testRestaurants.forEach((restaurant, index) => {
      console.log(`   ${index + 1}. ${restaurant.name} (${restaurant.ownerId?.email})`);
    });

    const today = new Date();
    const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

    for (let i = 0; i < testRestaurants.length; i++) {
      const restaurant = testRestaurants[i];
      
      console.log(`\n📋 Creating orders for ${restaurant.name}...`);
      
      // Create 3-5 orders for each restaurant with different statuses
      const orderCount = 3 + Math.floor(Math.random() * 3); // 3-5 orders
      
      for (let j = 0; j < orderCount; j++) {
        const status = orderStatuses[j % orderStatuses.length];
        const amount = 50 + Math.floor(Math.random() * 200); // ₹50-250
        
        // First, we need to find a menu item for this restaurant
        const { MenuItem } = require('./models');
        const menuItems = await MenuItem.find({ restaurantId: restaurant._id });
        
        let menuItemId;
        if (menuItems.length > 0) {
          menuItemId = menuItems[0]._id;
        } else {
          // Create a test menu item if none exists
          const testMenuItem = new MenuItem({
            restaurantId: restaurant._id,
            name: `Test Item ${j + 1}`,
            description: 'Test menu item for dashboard testing',
            price: amount / 2,
            category: 'Test Category',
            isAvailable: true
          });
          await testMenuItem.save();
          menuItemId = testMenuItem._id;
        }

        const orderData = {
          restaurantId: restaurant._id,
          studentId: testStudent._id,
          items: [{
            menuItemId: menuItemId,
            name: `Test Item ${j + 1}`,
            price: amount / 2,
            quantity: 2
          }],
          totalAmount: amount,
          status: status,
          orderNumber: `TEST${Date.now()}${j}`,
          createdAt: new Date(today.getTime() - Math.random() * 12 * 60 * 60 * 1000), // Random time today
          deliveryAddress: 'Test Address, IIT Tirupati',
          phone: '9876543210',
          paymentMethod: 'UPI',
          paymentStatus: status === 'delivered' ? 'paid' : 'pending'
        };

        try {
          const newOrder = new Order(orderData);
          await newOrder.save();
          console.log(`   ✅ Created order: ${orderData.orderNumber} (${status}) - ₹${amount}`);
        } catch (error) {
          console.log(`   ❌ Failed to create order: ${error.message}`);
        }
      }
    }

    // Show summary
    console.log('\n📊 Summary of created orders:');
    const newOrders = await Order.find({
      createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
    }).populate('restaurantId', 'name');

    const summary = {};
    newOrders.forEach(order => {
      const restaurantName = order.restaurantId?.name || 'Unknown';
      if (!summary[restaurantName]) {
        summary[restaurantName] = { total: 0, byStatus: {} };
      }
      summary[restaurantName].total++;
      summary[restaurantName].byStatus[order.status] = (summary[restaurantName].byStatus[order.status] || 0) + 1;
    });

    Object.entries(summary).forEach(([restaurantName, data]) => {
      console.log(`\n   🏪 ${restaurantName}: ${data.total} orders`);
      Object.entries(data.byStatus).forEach(([status, count]) => {
        console.log(`      ${status}: ${count}`);
      });
    });

    console.log('\n🎉 Test orders created successfully!');
    console.log('💡 Now refresh your restaurant dashboard to see real-time data.');

  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createTestOrders();
}

module.exports = { createTestOrders };