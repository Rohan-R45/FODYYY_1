const mongoose = require('mongoose');
require('dotenv').config();

async function addDeliveredOrders() {
  console.log('🚚 Adding Delivered Orders for Today\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { Restaurant, Order, User, MenuItem } = require('./models');

    // Find restaurants that have orders today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurantsWithOrders = await Order.distinct('restaurantId', {
      createdAt: { $gte: today }
    });

    console.log(`📊 Found ${restaurantsWithOrders.length} restaurants with orders today`);

    for (const restaurantId of restaurantsWithOrders.slice(0, 3)) {
      const restaurant = await Restaurant.findById(restaurantId);
      const students = await User.find({ role: 'student' });
      const menuItems = await MenuItem.find({ restaurantId: restaurantId });

      if (students.length === 0 || menuItems.length === 0) continue;

      console.log(`\n🏪 Adding delivered orders for: ${restaurant.name}`);

      // Add 2-3 delivered orders
      const deliveredCount = 2 + Math.floor(Math.random() * 2); // 2-3 orders

      for (let i = 0; i < deliveredCount; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const amount = 80 + Math.floor(Math.random() * 150); // ₹80-230

        const orderData = {
          restaurantId: restaurantId,
          studentId: student._id,
          items: [{
            menuItemId: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: Math.floor(amount / menuItem.price) || 1
          }],
          totalAmount: amount,
          status: 'delivered',
          orderNumber: `DEL${Date.now()}${i}`,
          createdAt: new Date(today.getTime() + Math.random() * 12 * 60 * 60 * 1000), // Random time today
          deliveryAddress: 'Test Delivery Address, IIT Tirupati',
          phone: '9876543210',
          paymentMethod: 'UPI',
          paymentStatus: 'paid',
          deliveredAt: new Date()
        };

        try {
          const newOrder = new Order(orderData);
          await newOrder.save();
          console.log(`   ✅ Created delivered order: ${orderData.orderNumber} - ₹${amount}`);
        } catch (error) {
          console.log(`   ❌ Failed to create delivered order: ${error.message}`);
        }
      }
    }

    // Show updated summary
    console.log('\n📊 Updated summary of today\'s orders:');
    const todayOrders = await Order.find({
      createdAt: { $gte: today }
    }).populate('restaurantId', 'name');

    const summary = {};
    todayOrders.forEach(order => {
      const restaurantName = order.restaurantId?.name || 'Unknown';
      if (!summary[restaurantName]) {
        summary[restaurantName] = { total: 0, revenue: 0, byStatus: {} };
      }
      summary[restaurantName].total++;
      summary[restaurantName].revenue += order.totalAmount;
      summary[restaurantName].byStatus[order.status] = (summary[restaurantName].byStatus[order.status] || 0) + 1;
    });

    Object.entries(summary).forEach(([restaurantName, data]) => {
      console.log(`\n   🏪 ${restaurantName}:`);
      console.log(`      📊 Total orders: ${data.total}`);
      console.log(`      💰 Revenue: ₹${data.revenue}`);
      console.log(`      📈 Status breakdown:`);
      Object.entries(data.byStatus).forEach(([status, count]) => {
        console.log(`         ${status}: ${count}`);
      });
      
      // Calculate pending vs completed
      const pending = (data.byStatus.pending || 0) + 
                     (data.byStatus.confirmed || 0) + 
                     (data.byStatus.preparing || 0) + 
                     (data.byStatus.ready || 0);
      const completed = data.byStatus.delivered || 0;
      
      console.log(`      ⏳ Pending: ${pending}`);
      console.log(`      ✅ Completed: ${completed}`);
    });

    console.log('\n🎉 Delivered orders added successfully!');
    console.log('💡 Dashboard should now show real-time data with today\'s orders and revenue.');

  } catch (error) {
    console.error('❌ Error adding delivered orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  addDeliveredOrders();
}

module.exports = { addDeliveredOrders };