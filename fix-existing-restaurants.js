const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User, Restaurant } = require('./models');

async function fixExistingRestaurants() {
  try {
    console.log('🔧 Fixing existing restaurant users without Restaurant profiles...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all restaurant users
    const restaurantUsers = await User.find({ role: 'restaurant' });
    console.log(`📊 Found ${restaurantUsers.length} restaurant users`);

    let fixed = 0;
    let alreadyHaveProfile = 0;

    for (const user of restaurantUsers) {
      // Check if this user already has a restaurant profile
      const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });
      
      if (existingRestaurant) {
        console.log(`✅ ${user.email} already has restaurant profile: ${existingRestaurant.name}`);
        alreadyHaveProfile++;
        continue;
      }

      // Create a basic restaurant profile for this user
      try {
        const restaurant = await Restaurant.create({
          ownerId: user._id,
          name: `${user.name}'s Restaurant`, // Default name
          description: 'Welcome to our restaurant! We serve delicious food with love and care.',
          address: user.address || 'IIT Tirupati Campus', // Use user address or default
          phone: user.phone,
          cuisine: ['Indian'], // Default cuisine
          deliveryTime: '30-45 mins',
          priceRange: '$$',
          isActive: true
        });

        console.log(`✅ Created restaurant profile for ${user.email}: ${restaurant.name}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Failed to create restaurant profile for ${user.email}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total restaurant users: ${restaurantUsers.length}`);
    console.log(`   Already had profiles: ${alreadyHaveProfile}`);
    console.log(`   Fixed (created profiles): ${fixed}`);
    console.log(`   Failed: ${restaurantUsers.length - alreadyHaveProfile - fixed}`);

    if (fixed > 0) {
      console.log('\n🎉 Restaurant profiles created successfully!');
      console.log('   Restaurant owners can now:');
      console.log('   - Access their dashboard without errors');
      console.log('   - Edit their restaurant profile');
      console.log('   - Add menu items');
      console.log('   - Manage orders');
    }

  } catch (error) {
    console.error('❌ Error fixing restaurant profiles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixExistingRestaurants();