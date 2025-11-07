const mongoose = require('mongoose');
const Order = require('./models/Order');

// Helper function to calculate order total (same as in routes/orders.js)
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

async function updateExistingOrders() {
  try {
    console.log('🔄 Starting to update existing orders with itemTotal...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/fodyyy';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all orders that don't have itemTotal set
    const ordersWithoutItemTotal = await Order.find({
      $or: [
        { itemTotal: { $exists: false } },
        { itemTotal: null },
        { itemTotal: { $lte: 0 } }
      ]
    });

    console.log(`📊 Found ${ordersWithoutItemTotal.length} orders that need itemTotal updates`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of ordersWithoutItemTotal) {
      try {
        // Calculate itemTotal from order items
        const calculatedItemTotal = calculateOrderTotal(order.items);

        // Update the order with the calculated itemTotal
        await Order.findByIdAndUpdate(order._id, {
          itemTotal: Math.round(calculatedItemTotal * 100) / 100
        });

        updatedCount++;
        console.log(`✅ Updated order ${order._id}: itemTotal = ₹${calculatedItemTotal.toFixed(2)}`);
      } catch (error) {
        console.error(`❌ Error updating order ${order._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Update Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} orders`);
    console.log(`❌ Errors: ${errorCount} orders`);

    // Verify a few orders to ensure they were updated correctly
    console.log('\n🔍 Verifying updates...');
    const sampleOrders = await Order.find({ itemTotal: { $gt: 0 } }).limit(3);
    sampleOrders.forEach(order => {
      console.log(`Order ${order._id}: itemTotal = ₹${order.itemTotal}`);
    });

  } catch (error) {
    console.error('❌ Error updating orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateExistingOrders();