const mongoose = require('mongoose');
const { Restaurant, MenuItem } = require('./models');

// Load environment variables
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

async function createTestMenuItems() {
  console.log('🍽️  CREATING TEST MENU ITEMS FOR RESTAURANTS\n');

  try {
    await connectDB();

    // Get all active restaurants
    const restaurants = await Restaurant.find({ isActive: true });
    console.log(`Found ${restaurants.length} active restaurants`);

    if (restaurants.length === 0) {
      console.log('❌ No active restaurants found');
      return;
    }

    // Sample menu items for each restaurant
    const menuItemTemplates = [
      // Main Course Items
      {
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken pieces',
        price: 15.99,
        category: 'Lunch',
        isVegetarian: false,
        isAvailable: true
      },
      {
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in rich spiced gravy',
        price: 13.99,
        category: 'Lunch',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Biryani Special',
        description: 'Aromatic basmati rice with spices and your choice of protein',
        price: 16.99,
        category: 'Dinner',
        isVegetarian: false,
        isAvailable: true
      },
      {
        name: 'Dal Tadka',
        description: 'Yellow lentils tempered with cumin and spices',
        price: 9.99,
        category: 'Lunch',
        isVegetarian: true,
        isAvailable: true
      },
      
      // Breakfast Items
      {
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato mixture',
        price: 8.99,
        category: 'Breakfast',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Idli Sambar',
        description: 'Steamed rice cakes served with lentil curry',
        price: 7.99,
        category: 'Breakfast',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Poha',
        description: 'Flattened rice with onions, peas and spices',
        price: 6.99,
        category: 'Breakfast',
        isVegetarian: true,
        isAvailable: true
      },

      // Snacks
      {
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes and peas',
        price: 4.99,
        category: 'Snacks',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Pakora',
        description: 'Deep-fried fritters with vegetables and chickpea batter',
        price: 5.99,
        category: 'Snacks',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Chicken Wings',
        description: 'Spicy marinated chicken wings',
        price: 11.99,
        category: 'Snacks',
        isVegetarian: false,
        isAvailable: true
      },

      // Beverages
      {
        name: 'Masala Chai',
        description: 'Traditional spiced tea with milk',
        price: 3.99,
        category: 'Beverages',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime juice with soda water',
        price: 4.99,
        category: 'Beverages',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Mango Lassi',
        description: 'Creamy yogurt drink with fresh mango',
        price: 5.99,
        category: 'Beverages',
        isVegetarian: true,
        isAvailable: true
      },

      // Desserts
      {
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in sugar syrup',
        price: 6.99,
        category: 'Desserts',
        isVegetarian: true,
        isAvailable: true
      },
      {
        name: 'Kulfi',
        description: 'Traditional Indian ice cream with cardamom',
        price: 5.99,
        category: 'Desserts',
        isVegetarian: true,
        isAvailable: true
      }
    ];

    let totalCreated = 0;

    // Create menu items for each restaurant
    for (const restaurant of restaurants) {
      console.log(`\n📝 Creating menu items for: ${restaurant.name}`);
      
      // Create 8-12 random menu items for each restaurant
      const numItems = Math.floor(Math.random() * 5) + 8; // 8-12 items
      const selectedItems = [];
      
      // Randomly select items from templates
      const shuffled = [...menuItemTemplates].sort(() => 0.5 - Math.random());
      for (let i = 0; i < Math.min(numItems, shuffled.length); i++) {
        const item = { ...shuffled[i] };
        item.restaurantId = restaurant._id;
        
        // Add some price variation (ensure exactly 2 decimal places)
        const variation = (Math.random() - 0.5) * 4;
        item.price = Math.round((item.price + variation) * 100) / 100;
        if (item.price < 1) item.price = 1.99;
        
        // Ensure price has exactly 2 decimal places
        item.price = parseFloat(item.price.toFixed(2));
        
        selectedItems.push(item);
      }

      try {
        // First, remove any existing menu items for this restaurant
        await MenuItem.deleteMany({ restaurantId: restaurant._id });
        
        // Debug: log first item to check structure
        if (selectedItems.length > 0) {
          console.log(`   🔍 Sample item structure:`, JSON.stringify(selectedItems[0], null, 2));
        }
        
        const createdItems = await MenuItem.insertMany(selectedItems);
        console.log(`   ✅ Created ${createdItems.length} menu items`);
        totalCreated += createdItems.length;
      } catch (error) {
        console.error(`   ❌ Error creating menu items for ${restaurant.name}:`, error.message);
        
        // If it's a validation error, try creating items one by one to identify the problematic one
        if (error.name === 'ValidationError') {
          console.log(`   🔍 Trying individual creation to identify issues...`);
          for (let i = 0; i < selectedItems.length; i++) {
            try {
              const item = new MenuItem(selectedItems[i]);
              await item.save();
              console.log(`     ✅ Item ${i + 1}: ${selectedItems[i].name}`);
              totalCreated++;
            } catch (itemError) {
              console.error(`     ❌ Item ${i + 1} (${selectedItems[i].name}): ${itemError.message}`);
              console.error(`        Item data:`, JSON.stringify(selectedItems[i], null, 2));
            }
          }
        }
      }
    }

    console.log(`\n🎉 COMPLETED! Created ${totalCreated} total menu items across ${restaurants.length} restaurants`);
    
    // Update restaurant ratings to make them more realistic
    console.log('\n⭐ Updating restaurant ratings...');
    for (const restaurant of restaurants) {
      const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0 rating
      await Restaurant.findByIdAndUpdate(restaurant._id, { rating });
    }
    console.log('✅ Updated restaurant ratings');

    console.log('\n🎯 TEST DATA CREATION COMPLETE!');
    console.log('   Your restaurants now have menu items and ratings');
    console.log('   Try refreshing your student dashboard and clicking on restaurants');

  } catch (error) {
    console.error('❌ Error creating test menu items:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createTestMenuItems();