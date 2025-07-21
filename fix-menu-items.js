const mongoose = require('mongoose');
const { Restaurant, MenuItem } = require('./models');

// Load environment variables
require('dotenv').config();

async function fixMenuItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // First, clear ALL existing menu items
    console.log('🧹 Clearing all existing menu items...');
    const deleteResult = await MenuItem.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing menu items`);

    // Get all restaurants
    const restaurants = await Restaurant.find({ isActive: true });
    console.log(`Found ${restaurants.length} restaurants`);

    // Simple, safe menu items
    const safeMenuItems = [
      { name: 'Butter Chicken', description: 'Creamy chicken curry', price: 15.99, category: 'Main Course', isVegetarian: false },
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 12.99, category: 'Main Course', isVegetarian: true },
      { name: 'Chicken Biryani', description: 'Aromatic rice with chicken', price: 16.99, category: 'Main Course', isVegetarian: false },
      { name: 'Dal Makhani', description: 'Creamy black lentils', price: 10.99, category: 'Main Course', isVegetarian: true },
      { name: 'Samosa', description: 'Crispy pastry snack', price: 4.99, category: 'Appetizer', isVegetarian: true },
      { name: 'Chicken Tikka', description: 'Grilled chicken pieces', price: 8.99, category: 'Appetizer', isVegetarian: false },
      { name: 'French Fries', description: 'Crispy golden fries', price: 5.99, category: 'Snacks', isVegetarian: true },
      { name: 'Chicken Wings', description: 'Spicy chicken wings', price: 11.99, category: 'Snacks', isVegetarian: false },
      { name: 'Masala Chai', description: 'Spiced tea', price: 3.99, category: 'Beverages', isVegetarian: true },
      { name: 'Mango Lassi', description: 'Yogurt mango drink', price: 5.99, category: 'Beverages', isVegetarian: true },
      { name: 'Gulab Jamun', description: 'Sweet milk balls', price: 6.99, category: 'Dessert', isVegetarian: true },
      { name: 'Ice Cream', description: 'Vanilla ice cream', price: 4.99, category: 'Dessert', isVegetarian: true }
    ];

    let totalCreated = 0;

    for (const restaurant of restaurants) {
      console.log(`\n📝 Creating menu for: ${restaurant.name}`);
      
      // Create items one by one for better error handling
      let createdCount = 0;
      
      for (const template of safeMenuItems) {
        try {
          const menuItem = new MenuItem({
            ...template,
            restaurantId: restaurant._id,
            isAvailable: true,
            spiceLevel: 'Medium',
            preparationTime: 15
          });
          
          await menuItem.save();
          createdCount++;
        } catch (error) {
          console.error(`     ❌ Failed to create ${template.name}: ${error.message}`);
        }
      }
      
      console.log(`   ✅ Created ${createdCount} menu items`);
      totalCreated += createdCount;
    }

    console.log(`\n🎉 FINAL RESULT: Created ${totalCreated} menu items total`);
    
    // Verify the results
    console.log('\n🔍 Verification:');
    for (const restaurant of restaurants) {
      const count = await MenuItem.countDocuments({ restaurantId: restaurant._id });
      console.log(`   ${restaurant.name}: ${count} menu items`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixMenuItems();