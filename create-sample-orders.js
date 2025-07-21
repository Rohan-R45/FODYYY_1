const mongoose = require('mongoose');
const { User, Restaurant, MenuItem, Order } = require('./models');

// Load environment variables
require('dotenv').config();

async function createSampleOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get sample data
    const students = await User.find({ role: 'student' }).limit(3);
    const restaurants = await Restaurant.find({ isActive: true }).limit(3);
    
    if (students.length === 0) {
      console.log('❌ No students found. Please create students first.');
      return;
    }
    
    if (restaurants.length === 0) {
      console.log('❌ No restaurants found. Please create restaurants first.');
      return;
    }

    console.log(`Found ${students.length} students and ${restaurants.length} restaurants`);

    // Create sample orders
    const sampleOrders = [];
    
    for (let i = 0; i < 10; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      
      // Get menu items for this restaurant
      const menuItems = await MenuItem.find({ 
        restaurantId: restaurant._id, 
        isAvailable: true 
      }).limit(5);
      
      if (menuItems.length === 0) continue;
      
      // Create order items (1-3 items per order)
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = menuItem.price;
        
        orderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity,
          price,
          specialInstructions: Math.random() > 0.7 ? 'Extra spicy' : ''
        });
        
        totalAmount += price * quantity;
      }
      
      // Random order status
      const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random order time (last 24 hours)
      const orderDate = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      
      // Calculate estimated delivery time
      const estimatedDeliveryTime = new Date(orderDate.getTime() + 45 * 60 * 1000);
      
      // Generate payment details
      const paymentMethod = Math.random() > 0.2 ? 'UPI' : 'Cash';
      const paymentStatus = Math.random() > 0.3 ? 'paid' : 'pending';
      
      let paymentDetails = {};
      let upiTransactionId = null;
      
      if (paymentMethod === 'UPI') {
        // Generate sample UPI transaction ID for paid orders
        if (paymentStatus === 'paid') {
          upiTransactionId = `UPI${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
          
          paymentDetails = {
            upiId: `restaurant${restaurant._id.toString().slice(-4)}@upi`,
            transactionId: upiTransactionId,
            paidAt: new Date(orderDate.getTime() + Math.random() * 30 * 60 * 1000),
            verifiedAt: Math.random() > 0.4 ? new Date(orderDate.getTime() + Math.random() * 60 * 60 * 1000) : null,
            notes: Math.random() > 0.6 ? 'Payment verified manually' : ''
          };
        } else {
          paymentDetails = {
            upiId: `restaurant${restaurant._id.toString().slice(-4)}@upi`
          };
        }
      }

      const orderData = {
        studentId: student._id,
        restaurantId: restaurant._id,
        items: orderItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status,
        paymentStatus,
        paymentMethod,
        upiTransactionId,
        paymentDetails,
        deliveryAddress: `Room ${Math.floor(Math.random() * 500) + 100}, Hostel Block ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}, University Campus`,
        phone: student.phone || `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        specialInstructions: Math.random() > 0.6 ? 'Please call before delivery' : '',
        orderDate,
        estimatedDeliveryTime,
        actualDeliveryTime: status === 'delivered' ? new Date(estimatedDeliveryTime.getTime() + Math.random() * 30 * 60 * 1000) : null
      };
      
      sampleOrders.push(orderData);
    }
    
    // Insert orders
    if (sampleOrders.length > 0) {
      const createdOrders = await Order.insertMany(sampleOrders);
      console.log(`✅ Created ${createdOrders.length} sample orders`);
      
      // Display order summary
      console.log('\n📊 Order Summary:');
      const statusCounts = {};
      createdOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`);
      });
      
      console.log('\n🎯 Sample Orders Created Successfully!');
      console.log('You can now test:');
      console.log('1. Student order tracking');
      console.log('2. Restaurant order management');
      console.log('3. Real-time status updates');
      
      // Show some sample order IDs
      console.log('\n📋 Sample Order IDs for testing:');
      createdOrders.slice(0, 3).forEach((order, index) => {
        console.log(`   ${index + 1}. Order ID: ${order._id} (Status: ${order.status})`);
        console.log(`      Student: ${order.studentId}`);
        console.log(`      Restaurant: ${order.restaurantId}`);
        console.log(`      Total: ₹${order.totalAmount}`);
      });
      
    } else {
      console.log('❌ No orders could be created. Check menu items availability.');
    }

  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleOrders();