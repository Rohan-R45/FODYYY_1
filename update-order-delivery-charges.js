const mongoose = require('mongoose');
const Order = require('./models/Order');
const Restaurant = require('./models/Restaurant');

async function updateExistingOrdersDeliveryCharges() {
  try {
    console.log('🔄 Starting to update existing orders with deliveryCharge...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/fodyyy_dev';
    console.log(`📡 Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all orders that don't have deliveryCharge set or have it as 0
    const ordersWithoutDeliveryCharge = await Order.find({
      $or: [
        { deliveryCharge: { $exists: false } },
        { deliveryCharge: null },
        { deliveryCharge: { $lte: 0 } }
      ]
    }).populate('restaurantId', 'deliveryCharge');

    console.log(`📊 Found ${ordersWithoutDeliveryCharge.length} orders that need deliveryCharge updates`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of ordersWithoutDeliveryCharge) {
      try {
        // Get delivery charge from restaurant
        let deliveryCharge = 0;

        if (order.restaurantId && typeof order.restaurantId === 'object' && order.restaurantId.deliveryCharge !== undefined) {
          deliveryCharge = Number(order.restaurantId.deliveryCharge) || 0;
        } else {
          // If not populated, fetch the restaurant
          const restaurant = await Restaurant.findById(order.restaurantId).select('deliveryCharge');
          if (restaurant && restaurant.deliveryCharge !== undefined) {
            deliveryCharge = Number(restaurant.deliveryCharge) || 0;
          }
        }

        // Update the order with the delivery charge
        await Order.findByIdAndUpdate(order._id, {
          deliveryCharge: Math.round(deliveryCharge * 100) / 100
        });

        updatedCount++;
        console.log(`✅ Updated order ${order._id}: deliveryCharge = ₹${deliveryCharge.toFixed(2)}`);
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
    const sampleOrders = await Order.find({ deliveryCharge: { $gte: 0 } }).limit(3).select('deliveryCharge restaurantId');
    for (const order of sampleOrders) {
      console.log(`Order ${order._id}: deliveryCharge = ₹${order.deliveryCharge}`);
    }

  } catch (error) {
    console.error('❌ Error updating orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateExistingOrdersDeliveryCharges();