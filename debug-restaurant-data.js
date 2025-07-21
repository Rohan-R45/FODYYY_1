const mongoose = require('mongoose');
const { Restaurant, MenuItem, User } = require('./models');

// Load environment variables
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fodyyy');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

async function debugRestaurantData() {
  console.log('🔍 DEBUGGING RESTAURANT DATA LOADING ISSUES\n');

  try {
    // Connect to database
    await connectDB();

    // 1. Check total restaurants in database
    console.log('1️⃣ Checking restaurant data in database...');
    const totalRestaurants = await Restaurant.countDocuments();
    console.log(`   Total restaurants in database: ${totalRestaurants}`);

    if (totalRestaurants === 0) {
      console.log('❌ NO RESTAURANTS FOUND IN DATABASE');
      console.log('   This is why restaurant data is not loading!');
      console.log('   💡 SOLUTION: Create some test restaurants');
      await createTestRestaurants();
      return;
    }

    // 2. Check active restaurants
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true });
    console.log(`   Active restaurants: ${activeRestaurants}`);

    if (activeRestaurants === 0) {
      console.log('❌ NO ACTIVE RESTAURANTS FOUND');
      console.log('   All restaurants are inactive!');
      console.log('   💡 SOLUTION: Activate existing restaurants');
      await activateRestaurants();
      return;
    }

    // 3. Check restaurant data structure
    console.log('\n2️⃣ Checking restaurant data structure...');
    const sampleRestaurants = await Restaurant.find({ isActive: true })
      .populate('ownerId', 'name email')
      .limit(3)
      .lean();

    sampleRestaurants.forEach((restaurant, index) => {
      console.log(`   Restaurant ${index + 1}:`);
      console.log(`     ID: ${restaurant._id}`);
      console.log(`     Name: ${restaurant.name}`);
      console.log(`     Active: ${restaurant.isActive}`);
      console.log(`     Owner: ${restaurant.ownerId?.name || 'No owner'}`);
      console.log(`     Rating: ${restaurant.rating || 'No rating'}`);
      console.log(`     Cuisine: ${restaurant.cuisine?.join(', ') || 'No cuisine'}`);
      console.log(`     Address: ${restaurant.address || 'No address'}`);
      console.log('');
    });

    // 4. Check menu items for restaurants
    console.log('3️⃣ Checking menu items...');
    for (const restaurant of sampleRestaurants) {
      const menuCount = await MenuItem.countDocuments({
        restaurantId: restaurant._id,
        isAvailable: true
      });
      console.log(`   ${restaurant.name}: ${menuCount} menu items`);
    }

    // 5. Test API endpoint simulation
    console.log('\n4️⃣ Testing restaurant query (simulating API call)...');
    
    // Simulate the exact query from the API
    const query = { isActive: true };
    const sort = { rating: -1 };
    const limit = 8;

    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'name email phone')
      .sort(sort)
      .limit(limit)
      .lean();

    console.log(`   Query returned ${restaurants.length} restaurants`);
    
    if (restaurants.length === 0) {
      console.log('❌ QUERY RETURNED NO RESULTS');
      console.log('   This matches the frontend issue!');
    } else {
      console.log('✅ Query successful - restaurants found:');
      restaurants.forEach((r, i) => {
        console.log(`     ${i + 1}. ${r.name} (Rating: ${r.rating || 'N/A'})`);
      });
    }

    // 6. Check for common issues
    console.log('\n5️⃣ Checking for common issues...');
    
    // Check for restaurants without required fields
    const restaurantsWithoutName = await Restaurant.countDocuments({ 
      isActive: true, 
      $or: [{ name: { $exists: false } }, { name: '' }] 
    });
    
    const restaurantsWithoutAddress = await Restaurant.countDocuments({ 
      isActive: true, 
      $or: [{ address: { $exists: false } }, { address: '' }] 
    });

    console.log(`   Restaurants without name: ${restaurantsWithoutName}`);
    console.log(`   Restaurants without address: ${restaurantsWithoutAddress}`);

    // 7. Test specific restaurant by ID
    if (restaurants.length > 0) {
      console.log('\n6️⃣ Testing restaurant detail fetch...');
      const testRestaurant = restaurants[0];
      
      try {
        const restaurantDetail = await Restaurant.findById(testRestaurant._id)
          .populate('ownerId', 'name email phone')
          .lean();

        if (restaurantDetail) {
          console.log('✅ Restaurant detail fetch successful');
          console.log(`   Restaurant: ${restaurantDetail.name}`);
          
          // Check menu items
          const menuItems = await MenuItem.find({
            restaurantId: testRestaurant._id,
            isAvailable: true
          });
          
          console.log(`   Menu items: ${menuItems.length}`);
          
          if (menuItems.length === 0) {
            console.log('⚠️  No menu items found for this restaurant');
            console.log('   This could cause menu display issues');
          }
        } else {
          console.log('❌ Restaurant detail fetch failed');
        }
      } catch (error) {
        console.log('❌ Error fetching restaurant detail:', error.message);
      }
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE!');
    
    if (restaurants.length > 0) {
      console.log('✅ RESTAURANTS ARE AVAILABLE IN DATABASE');
      console.log('   The issue might be in the frontend or API connection');
      console.log('   Check:');
      console.log('   1. Frontend API calls');
      console.log('   2. Network connectivity');
      console.log('   3. Authentication tokens');
      console.log('   4. CORS settings');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function createTestRestaurants() {
  console.log('\n🏗️  Creating test restaurants...');
  
  try {
    // First, let's check if we have any restaurant owners
    const restaurantOwners = await User.find({ role: 'restaurant' }).limit(3);
    
    if (restaurantOwners.length === 0) {
      console.log('❌ No restaurant owners found in database');
      console.log('   💡 SOLUTION: Create restaurant owner accounts first');
      return;
    }

    const testRestaurants = [
      {
        name: 'Spice Garden',
        description: 'Authentic Indian cuisine with a modern twist',
        address: '123 Main Street, Food District, City 12345',
        phone: '+1234567890',
        cuisine: ['Indian', 'Vegetarian'],
        priceRange: 'medium',
        rating: 4.5,
        deliveryTime: '30-45 mins',
        isActive: true,
        ownerId: restaurantOwners[0]._id,
        paymentDetails: {
          upiId: 'spicegarden@upi',
          bankDetails: {
            accountName: 'Spice Garden Restaurant',
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank'
          }
        }
      },
      {
        name: 'Pizza Palace',
        description: 'Fresh wood-fired pizzas and Italian classics',
        address: '456 Oak Avenue, Downtown, City 12345',
        phone: '+1234567891',
        cuisine: ['Italian', 'Pizza'],
        priceRange: 'medium',
        rating: 4.2,
        deliveryTime: '25-35 mins',
        isActive: true,
        ownerId: restaurantOwners[1] ? restaurantOwners[1]._id : restaurantOwners[0]._id,
        paymentDetails: {
          upiId: 'pizzapalace@paytm',
          bankDetails: {
            accountName: 'Pizza Palace Ltd',
            accountNumber: '2345678901',
            ifscCode: 'ICIC0002345',
            bankName: 'ICICI Bank'
          }
        }
      },
      {
        name: 'Burger Barn',
        description: 'Gourmet burgers and crispy fries',
        address: '789 Elm Street, Uptown, City 12345',
        phone: '+1234567892',
        cuisine: ['American', 'Fast Food'],
        priceRange: 'low',
        rating: 4.0,
        deliveryTime: '20-30 mins',
        isActive: true,
        ownerId: restaurantOwners[2] ? restaurantOwners[2]._id : restaurantOwners[0]._id,
        paymentDetails: {
          upiId: 'burgerbarn@gpay',
          bankDetails: {
            accountName: 'Burger Barn Foods',
            accountNumber: '3456789012',
            ifscCode: 'SBIN0003456',
            bankName: 'State Bank of India'
          }
        }
      }
    ];

    const createdRestaurants = await Restaurant.insertMany(testRestaurants);
    console.log(`✅ Created ${createdRestaurants.length} test restaurants`);
    
    // Create some test menu items
    console.log('🍽️  Creating test menu items...');
    
    const testMenuItems = [];
    
    createdRestaurants.forEach((restaurant, index) => {
      const items = [
        {
          name: `Special Dish ${index + 1}`,
          description: `Delicious specialty from ${restaurant.name}`,
          price: 12.99 + index,
          category: 'Main Course',
          restaurantId: restaurant._id,
          isAvailable: true,
          isVegetarian: index % 2 === 0
        },
        {
          name: `Appetizer ${index + 1}`,
          description: `Fresh starter from ${restaurant.name}`,
          price: 6.99 + index,
          category: 'Appetizers',
          restaurantId: restaurant._id,
          isAvailable: true,
          isVegetarian: true
        }
      ];
      testMenuItems.push(...items);
    });

    const createdMenuItems = await MenuItem.insertMany(testMenuItems);
    console.log(`✅ Created ${createdMenuItems.length} test menu items`);
    
    console.log('\n🎉 TEST DATA CREATED SUCCESSFULLY!');
    console.log('   Try refreshing your student dashboard now');
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
  }
}

async function activateRestaurants() {
  console.log('\n🔄 Activating existing restaurants...');
  
  try {
    const result = await Restaurant.updateMany(
      { isActive: { $ne: true } },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Activated ${result.modifiedCount} restaurants`);
    
  } catch (error) {
    console.error('❌ Failed to activate restaurants:', error);
  }
}

// Run the debug
debugRestaurantData();