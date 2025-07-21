const mongoose = require('mongoose');
const { Restaurant, MenuItem } = require('./models');

// Load environment variables
require('dotenv').config();

async function createSimpleMenuItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get all restaurants
    const restaurants = await Restaurant.find({ isActive: true });
    console.log(`Found ${restaurants.length} restaurants`);

    // Simple menu items with ONLY valid categories
    const menuTemplates = [
      // Appetizers
      { name: 'Samosa', description: 'Crispy pastry with spiced filling', price: 4.99, category: 'Appetizer', isVegetarian: true, spiceLevel: 'Mild' },
      { name: 'Chicken Tikka', description: 'Grilled marinated chicken', price: 8.99, category: 'Appetizer', isVegetarian: false, spiceLevel: 'Medium' },
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 7.99, category: 'Appetizer', isVegetarian: true, spiceLevel: 'Mild' },
      { name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 6.99, category: 'Appetizer', isVegetarian: true, spiceLevel: 'Not Applicable' },

      // Main Course
      { name: 'Butter Chicken', description: 'Creamy tomato curry with chicken', price: 15.99, category: 'Main Course', isVegetarian: false, spiceLevel: 'Medium' },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese in rich gravy', price: 13.99, category: 'Main Course', isVegetarian: true, spiceLevel: 'Medium' },
      { name: 'Biryani', description: 'Aromatic rice with spices', price: 16.99, category: 'Main Course', isVegetarian: false, spiceLevel: 'Mild' },
      { name: 'Dal Makhani', description: 'Creamy black lentils', price: 11.99, category: 'Main Course', isVegetarian: true, spiceLevel: 'Mild' },
      { name: 'Grilled Chicken', description: 'Herb-crusted grilled chicken', price: 18.99, category: 'Main Course', isVegetarian: false, spiceLevel: 'Medium' },
      { name: 'Vegetable Curry', description: 'Mixed vegetables in curry', price: 10.99, category: 'Main Course', isVegetarian: true, spiceLevel: 'Medium' },

      // Snacks
      { name: 'French Fries', description: 'Crispy golden fries', price: 4.99, category: 'Snacks', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Chicken Wings', description: 'Spicy marinated wings', price: 11.99, category: 'Snacks', isVegetarian: false, spiceLevel: 'Hot' },
      { name: 'Pakora', description: 'Deep-fried vegetable fritters', price: 5.99, category: 'Snacks', isVegetarian: true, spiceLevel: 'Medium' },
      { name: 'Nachos', description: 'Tortilla chips with cheese', price: 7.99, category: 'Snacks', isVegetarian: true, spiceLevel: 'Medium' },

      // Beverages
      { name: 'Masala Chai', description: 'Spiced tea with milk', price: 3.99, category: 'Beverages', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Fresh Lime Soda', description: 'Refreshing lime drink', price: 4.99, category: 'Beverages', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Mango Lassi', description: 'Yogurt drink with mango', price: 5.99, category: 'Beverages', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Cold Coffee', description: 'Iced coffee with milk', price: 4.99, category: 'Beverages', isVegetarian: true, spiceLevel: 'Not Applicable' },

      // Desserts (note: singular "Dessert" not "Desserts")
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings', price: 6.99, category: 'Dessert', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Kulfi', description: 'Traditional Indian ice cream', price: 5.99, category: 'Dessert', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Chocolate Cake', description: 'Rich chocolate cake', price: 7.99, category: 'Dessert', isVegetarian: true, spiceLevel: 'Not Applicable' },
      { name: 'Ice Cream', description: 'Vanilla ice cream', price: 4.99, category: 'Dessert', isVegetarian: true, spiceLevel: 'Not Applicable' }
    ];

    let totalCreated = 0;

    for (const restaurant of restaurants) {
      console.log(`\n📝 Creating menu for: ${restaurant.name}`);
      
      // Clear existing menu items
      await MenuItem.deleteMany({ restaurantId: restaurant._id });
      
      // Select 8-12 random items for each restaurant
      const numItems = Math.floor(Math.random() * 5) + 8;
      const shuffled = [...menuTemplates].sort(() => 0.5 - Math.random());
      const selectedItems = shuffled.slice(0, numItems);
      
      // Add restaurant ID and use fixed prices (no variation to avoid precision issues)
      const menuItems = selectedItems.map(item => ({
        ...item,
        restaurantId: restaurant._id,
        price: item.price, // Use original price without variation
        isAvailable: true
      }));

      try {
        const created = await MenuItem.insertMany(menuItems);
        console.log(`   ✅ Created ${created.length} menu items`);
        totalCreated += created.length;
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n🎉 SUCCESS! Created ${totalCreated} menu items total`);
    console.log('🎯 Your restaurants now have working menus!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSimpleMenuItems();