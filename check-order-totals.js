const mongoose = require('mongoose');
const Order = require('./models/Order');

async function checkOrderTotals() {
  try {
    console.log('🔄 Starting order totals check...');
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/fodyyy_dev';
    console.log(`📡 Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check a few orders
    const orders = await Order.find({}).limit(5).select('itemTotal totalAmount items');
    console.log(`📊 Found ${orders.length} orders to check`);

    orders.forEach((order, index) => {
      const calculatedTotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      console.log(`Order ${index + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  itemTotal: ₹${order.itemTotal || 'NOT SET'}`);
      console.log(`  totalAmount: ₹${order.totalAmount}`);
      console.log(`  Calculated from items: ₹${calculatedTotal.toFixed(2)}`);
      console.log(`  Match: ${order.itemTotal === calculatedTotal ? '✅' : '❌'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkOrderTotals();