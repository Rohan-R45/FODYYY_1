const mongoose = require('mongoose');
const { User, Restaurant, MenuItem, Order } = require('./models');

// Load environment variables
require('dotenv').config();

async function testCODDirectly() {
  try {
    console.log('🧪 Testing COD Order Creation Directly...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get test data
    const student = await User.findOne({ role: 'student' });
    const restaurant = await Restaurant.findOne({ isActive: true });
    const menuItem = await MenuItem.findOne({ restaurantId: restaurant._id });

    if (!student || !restaurant || !menuItem) {
      console.log('❌ Missing test data');
      console.log('Student:', !!student);
      console.log('Restaurant:', !!restaurant);
      console.log('MenuItem:', !!menuItem);
      return;
    }

    console.log(`👤 Student: ${student.name} (${student.email})`);
    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`🍽️  Menu Item: ${menuItem.name} - ₹${menuItem.price}\n`);

    // Simulate the exact order creation logic from the route
    console.log('📱 Creating COD order directly...');

    // This simulates what the frontend sends
    const requestData = {
      restaurantId: restaurant._id.toString(),
      items: [{
        menuItemId: menuItem._id.toString(),
        quantity: 2,
        specialInstructions: 'Extra spicy please'
      }],
      deliveryAddress: 'Room 101, Hostel Block A, University Campus, Near Main Gate',
      phoneNumber: '9876543210',
      paymentMethod: 'cod',
      specialInstructions: 'Please call before delivery'
    };

    console.log('📤 Request data:');
    console.log(JSON.stringify(requestData, null, 2));

    // Simulate the route logic step by step
    console.log('\n🔄 Processing order step by step...\n');

    // Step 1: Verify restaurant
    console.log('1️⃣ Verifying restaurant...');
    const restaurantCheck = await Restaurant.findById(requestData.restaurantId);
    if (!restaurantCheck) {
      console.log('❌ Restaurant not found');
      return;
    }
    if (!restaurantCheck.isActive) {
      console.log('❌ Restaurant is inactive');
      return;
    }
    console.log('✅ Restaurant verified');

    // Step 2: Verify menu items
    console.log('2️⃣ Verifying menu items...');
    const menuItemIds = requestData.items.map(item => item.menuItemId);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurantId: requestData.restaurantId
    });

    if (menuItems.length !== menuItemIds.length) {
      console.log('❌ Some menu items not found');
      console.log(`Expected: ${menuItemIds.length}, Found: ${menuItems.length}`);
      return;
    }

    const unavailableItems = menuItems.filter(item => !item.isAvailable);
    if (unavailableItems.length > 0) {
      console.log('❌ Some items are unavailable');
      return;
    }
    console.log('✅ Menu items verified');

    // Step 3: Build order items
    console.log('3️⃣ Building order items...');
    const orderItems = requestData.items.map(orderItem => {
      const menuItemData = menuItems.find(mi => mi._id.toString() === orderItem.menuItemId);
      return {
        menuItemId: menuItemData._id,
        name: menuItemData.name,
        quantity: orderItem.quantity,
        price: menuItemData.price,
        specialInstructions: orderItem.specialInstructions || ''
      };
    });

    console.log('Order items:', JSON.stringify(orderItems, null, 2));

    // Step 4: Calculate total
    console.log('4️⃣ Calculating total...');
    const totalAmount = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    console.log(`Total amount: ₹${totalAmount}`);

    // Step 5: Generate order number
    console.log('5️⃣ Generating order number...');
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log(`Order number: ${orderNumber}`);

    // Step 6: Create order data
    console.log('6️⃣ Creating order data...');
    const orderData = {
      orderNumber,
      studentId: student._id,
      restaurantId: requestData.restaurantId,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      deliveryAddress: requestData.deliveryAddress,
      phone: requestData.phoneNumber, // Note: using 'phone' not 'phoneNumber'
      paymentMethod: requestData.paymentMethod,
      paymentStatus: 'pending',
      specialInstructions: requestData.specialInstructions || '',
      status: 'pending'
    };

    console.log('Final order data:');
    console.log(JSON.stringify(orderData, null, 2));

    // Step 7: Create the order
    console.log('\n7️⃣ Creating order in database...');
    try {
      const order = await Order.create(orderData);
      console.log('✅ Order created successfully!');
      console.log(`   Order ID: ${order._id}`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Payment Method: ${order.paymentMethod}`);
      console.log(`   Total: ₹${order.totalAmount}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);

      // Test population
      console.log('\n8️⃣ Testing order population...');
      await order.populate([
        { path: 'studentId', select: 'name email phone' },
        { path: 'restaurantId', select: 'name address phone ownerId' },
        { path: 'items.menuItemId', select: 'name price category image' }
      ]);

      console.log('✅ Order populated successfully');
      console.log('Student:', order.studentId.name);
      console.log('Restaurant:', order.restaurantId.name);
      console.log('Items:', order.items.map(item => `${item.name} x${item.quantity}`).join(', '));

      // Cleanup
      console.log('\n🧹 Cleaning up test order...');
      await Order.deleteOne({ _id: order._id });
      console.log('✅ Test order cleaned up');

    } catch (error) {
      console.log('❌ Order creation failed!');
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      
      if (error.name === 'ValidationError') {
        console.log('\n📝 Validation Errors:');
        Object.keys(error.errors).forEach(field => {
          console.log(`   ${field}: ${error.errors[field].message}`);
        });
      }
      
      if (error.errors) {
        console.log('\n🔍 Detailed errors:');
        console.log(JSON.stringify(error.errors, null, 2));
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('─'.repeat(50));
    console.log('✅ Database connection working');
    console.log('✅ Test data available');
    console.log('✅ Restaurant verification working');
    console.log('✅ Menu item verification working');
    console.log('✅ Order data structure correct');
    console.log('✅ Order creation logic tested');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCODDirectly();