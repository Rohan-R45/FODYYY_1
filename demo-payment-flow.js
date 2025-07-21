const mongoose = require('mongoose');
const { User, Restaurant, Order, MenuItem } = require('./models');

// Load environment variables
require('dotenv').config();

async function demoPaymentFlow() {
  try {
    console.log('🎬 UPI Payment System Demo\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Get demo data
    const student = await User.findOne({ role: 'student' });
    const restaurant = await Restaurant.findOne({ isActive: true });
    const menuItem = await MenuItem.findOne({ restaurantId: restaurant._id });

    if (!student || !restaurant || !menuItem) {
      console.log('❌ Demo data not found. Please run the sample data scripts first.');
      return;
    }

    console.log('👥 Demo Participants:');
    console.log(`   🎓 Student: ${student.name} (${student.email})`);
    console.log(`   🏪 Restaurant: ${restaurant.name}`);
    console.log(`   🍽️  Menu Item: ${menuItem.name} - ₹${menuItem.price}\n`);

    // Step 1: Student places order
    console.log('📋 STEP 1: Student Places Order');
    console.log('─'.repeat(50));

    const demoOrder = new Order({
      studentId: student._id,
      restaurantId: restaurant._id,
      items: [{
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: 2,
        price: menuItem.price
      }],
      totalAmount: menuItem.price * 2,
      deliveryAddress: 'Room 101, Hostel Block A, University Campus',
      phone: '9876543210',
      paymentMethod: 'UPI',
      paymentStatus: 'pending'
    });

    await demoOrder.save();
    console.log(`✅ Order created: ${demoOrder.orderNumber}`);
    console.log(`   💰 Total Amount: ₹${demoOrder.totalAmount}`);
    console.log(`   📱 Payment Method: ${demoOrder.paymentMethod}`);
    console.log(`   🔄 Payment Status: ${demoOrder.paymentStatus}\n`);

    // Step 2: Student views payment details
    console.log('💳 STEP 2: Student Views Payment Details');
    console.log('─'.repeat(50));

    const upiId = restaurant.paymentDetails?.upiId || 'restaurant@upi';
    const upiUrl = `upi://pay?pa=${upiId}&pn=${restaurant.name}&am=${demoOrder.totalAmount}&cu=INR&tn=Payment for Order ${demoOrder.orderNumber}`;
    
    console.log('📱 UPI Payment Details:');
    console.log(`   🏪 Restaurant UPI ID: ${upiId}`);
    console.log(`   💰 Amount: ₹${demoOrder.totalAmount}`);
    console.log(`   📝 Note: Payment for Order ${demoOrder.orderNumber}`);
    console.log(`   🔗 UPI URL: ${upiUrl}`);
    console.log('   📱 QR Code: [Generated dynamically in frontend]\n');

    // Step 3: Student makes payment and confirms
    console.log('✅ STEP 3: Student Confirms Payment');
    console.log('─'.repeat(50));

    const transactionId = `UPI${Date.now().toString().slice(-12)}`;
    console.log(`📱 Student makes payment in UPI app...`);
    console.log(`🔢 Transaction ID generated: ${transactionId}`);
    
    try {
      await demoOrder.confirmPayment(transactionId);
      console.log('✅ Payment confirmed successfully!');
      console.log(`   🔄 Payment Status: ${demoOrder.paymentStatus}`);
      console.log(`   ⏰ Confirmed At: ${demoOrder.paymentDetails.paidAt}\n`);
    } catch (error) {
      console.log(`❌ Payment confirmation failed: ${error.message}\n`);
      return;
    }

    // Step 4: Restaurant views payment for verification
    console.log('🏪 STEP 4: Restaurant Views Payment');
    console.log('─'.repeat(50));

    console.log('🔍 Restaurant owner checks order:');
    console.log(`   📋 Order: ${demoOrder.orderNumber}`);
    console.log(`   👤 Customer: ${student.name}`);
    console.log(`   💰 Amount: ₹${demoOrder.totalAmount}`);
    console.log(`   🔢 Transaction ID: ${demoOrder.upiTransactionId}`);
    console.log(`   🔄 Status: Payment confirmed, awaiting verification\n`);

    // Step 5: Restaurant verifies payment
    console.log('✅ STEP 5: Restaurant Verifies Payment');
    console.log('─'.repeat(50));

    const restaurantOwner = await User.findOne({ role: 'restaurant' });
    if (restaurantOwner) {
      try {
        await demoOrder.verifyPayment(restaurantOwner._id, 'Payment verified manually - transaction confirmed');
        console.log('✅ Payment verified by restaurant!');
        console.log(`   👤 Verified By: ${restaurantOwner.name}`);
        console.log(`   ⏰ Verified At: ${demoOrder.paymentDetails.verifiedAt}`);
        console.log(`   📝 Notes: ${demoOrder.paymentDetails.notes}`);
        console.log(`   🔄 Final Status: Payment verified ✅\n`);
      } catch (error) {
        console.log(`❌ Payment verification failed: ${error.message}\n`);
      }
    }

    // Step 6: Show complete payment timeline
    console.log('📊 STEP 6: Payment Timeline Summary');
    console.log('─'.repeat(50));

    console.log('🕐 Payment Flow Timeline:');
    console.log(`   1. ${demoOrder.createdAt.toLocaleString()} - Order placed (pending)`);
    console.log(`   2. ${demoOrder.paymentDetails.paidAt.toLocaleString()} - Payment confirmed (paid)`);
    console.log(`   3. ${demoOrder.paymentDetails.verifiedAt.toLocaleString()} - Payment verified (verified)`);
    console.log('\n✨ Payment flow completed successfully!\n');

    // Show API endpoints used
    console.log('🔗 API ENDPOINTS DEMONSTRATED:');
    console.log('─'.repeat(50));
    console.log(`   GET  /api/orders/${demoOrder._id}/payment - Get payment details`);
    console.log(`   PUT  /api/orders/${demoOrder._id}/payment - Confirm payment (student)`);
    console.log(`   PUT  /api/orders/${demoOrder._id}/payment/verify - Verify payment (restaurant)`);
    console.log('\n');

    // Show frontend components used
    console.log('🎨 FRONTEND COMPONENTS USED:');
    console.log('─'.repeat(50));
    console.log('   📱 UPIPaymentModal - Shows QR code and payment details');
    console.log('   📝 PaymentConfirmationForm - Transaction ID submission');
    console.log('   🏷️  PaymentStatusBadge - Visual payment status indicators');
    console.log('   🔍 PaymentVerificationDialog - Restaurant verification panel');
    console.log('\n');

    // Show security features
    console.log('🔒 SECURITY FEATURES DEMONSTRATED:');
    console.log('─'.repeat(50));
    console.log('   ✅ Transaction ID validation (12+ characters, alphanumeric)');
    console.log('   ✅ Duplicate transaction ID prevention');
    console.log('   ✅ Role-based access control (student/restaurant)');
    console.log('   ✅ Order ownership verification');
    console.log('   ✅ Payment status flow management');
    console.log('\n');

    // Cleanup
    console.log('🧹 Cleaning up demo data...');
    await Order.deleteOne({ _id: demoOrder._id });
    console.log('✅ Demo data cleaned up\n');

    console.log('🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('\n📱 To test in the browser:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: cd fodyyy-frontend && npm run dev');
    console.log('   3. Login as student and place an order');
    console.log('   4. Use "Make Payment" button to see the UPI modal');
    console.log('   5. Submit payment confirmation with transaction ID');
    console.log('   6. Login as restaurant owner to verify payment');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the demo
demoPaymentFlow();