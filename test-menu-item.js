const mongoose = require('mongoose');
const { MenuItem, Restaurant } = require('./models');

// Load environment variables
require('dotenv').config();

async function testMenuItem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get first restaurant
    const restaurant = await Restaurant.findOne({ isActive: true });
    if (!restaurant) {
      console.log('❌ No restaurant found');
      return;
    }

    console.log('🏪 Testing with restaurant:', restaurant.name);

    // Test creating a simple menu item
    const testItem = {
      restaurantId: restaurant._id,
      name: 'Test Item',
      description: 'A test menu item',
      price: 10.99,
      category: 'Main Course',
      isVegetarian: true,
      isAvailable: true,
      spiceLevel: 'Mild'
    };

    console.log('📝 Creating test menu item:', testItem);

    const menuItem = new MenuItem(testItem);
    await menuItem.save();

    console.log('✅ Menu item created successfully!');
    console.log('📋 Created item:', menuItem);

    // Clean up
    await MenuItem.findByIdAndDelete(menuItem._id);
    console.log('🧹 Cleaned up test item');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`   ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    mongoose.connection.close();
  }
}

testMenuItem();