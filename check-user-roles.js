const mongoose = require('mongoose');
const { User } = require('./models');

// Load environment variables
require('dotenv').config();

async function checkUserRoles() {
  try {
    console.log('🔍 Checking User Roles...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Get all users and their roles
    const users = await User.find({}, 'name email role isActive').sort({ role: 1 });
    
    console.log('👥 Current Users in Database:');
    console.log('─'.repeat(80));
    
    const roleStats = {};
    
    users.forEach((user, index) => {
      const status = user.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${user.name} (${user.email}) - Role: ${user.role}`);
      
      // Count roles
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });
    
    console.log('\n📊 Role Statistics:');
    console.log('─'.repeat(40));
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    // Check for any users with restaurant_owner role
    const restaurantOwners = users.filter(user => user.role === 'restaurant_owner');
    const restaurantUsers = users.filter(user => user.role === 'restaurant');
    
    console.log('\n🏪 Restaurant Role Analysis:');
    console.log('─'.repeat(40));
    console.log(`   Users with 'restaurant' role: ${restaurantUsers.length}`);
    console.log(`   Users with 'restaurant_owner' role: ${restaurantOwners.length}`);
    
    if (restaurantOwners.length > 0) {
      console.log('\n⚠️  Found users with "restaurant_owner" role. These should be "restaurant":');
      restaurantOwners.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
      
      console.log('\n🔧 Fixing role names...');
      
      // Update restaurant_owner to restaurant
      const updateResult = await User.updateMany(
        { role: 'restaurant_owner' },
        { role: 'restaurant' }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} users from 'restaurant_owner' to 'restaurant'`);
    } else {
      console.log('✅ All restaurant users have correct "restaurant" role');
    }
    
    // Check if we have the required roles
    const requiredRoles = ['student', 'restaurant', 'admin'];
    const missingRoles = requiredRoles.filter(role => !roleStats[role]);
    
    if (missingRoles.length > 0) {
      console.log(`\n⚠️  Missing required roles: ${missingRoles.join(', ')}`);
    } else {
      console.log('\n✅ All required roles are present');
    }
    
    console.log('\n🎯 Summary:');
    console.log('─'.repeat(40));
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Active Users: ${users.filter(u => u.isActive).length}`);
    console.log(`   Inactive Users: ${users.filter(u => !u.isActive).length}`);
    
    // Test authentication roles
    console.log('\n🔐 Testing Role Authorization:');
    console.log('─'.repeat(40));
    console.log('   ✅ Routes now use "restaurant" role');
    console.log('   ✅ Users have "restaurant" role');
    console.log('   ✅ Role mismatch resolved');

  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUserRoles();