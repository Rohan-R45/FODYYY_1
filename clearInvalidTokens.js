const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

const User = require('./models/User');

async function clearInvalidTokens() {
  try {
    console.log('🔄 Connecting to MongoDB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // First, find and display invalid tokens
    console.log('\n🔍 Finding users with invalid tokens...');
    const usersWithInvalidTokens = await User.find({
      $or: [
        { 'fcmTokens.token': '0' },
        { 'fcmTokens.token': /^test/i }
      ]
    });
    console.log(`Found ${usersWithInvalidTokens.length} user(s) with invalid tokens`);
    
    usersWithInvalidTokens.forEach(user => {
      const invalidCount = user.fcmTokens.filter(t => t.token === '0' || /^test/i.test(t.token)).length;
      console.log(`  - ${user.name} (${user.email}): ${invalidCount} invalid token(s)`);
      user.fcmTokens.forEach(t => {
        if (t.token === '0' || /^test/i.test(t.token)) {
          console.log(`    - Removing: ${t.token}`);
        }
      });
    });

    // Remove invalid tokens
    const result = await User.updateMany(
      { 
        $or: [
          { 'fcmTokens.token': '0' },
          { 'fcmTokens.token': /^test/i }
        ]
      },
      { 
        $pull: { 
          fcmTokens: { 
            $or: [
              { token: '0' },
              { token: /^test/i }
            ]
          }
        }
      }
    );

    console.log(`\n📊 Updated ${result.modifiedCount} users`);
    console.log(`🧹 Removed invalid token(s)`);

    // Show remaining valid tokens
    const usersWithTokens = await User.find({ 'fcmTokens.0': { $exists: true } }).select('name email fcmTokens');
    console.log('\n📋 Users with FCM tokens:');
    if (usersWithTokens.length === 0) {
      console.log('  (none)');
    } else {
      usersWithTokens.forEach(user => {
        console.log(`  - ${user.name} (${user.email}): ${user.fcmTokens.length} token(s)`);
        user.fcmTokens.forEach((t, i) => {
          const preview = t.token ? t.token.substring(0, 20) : 'N/A';
          console.log(`    [${i}] Device: ${t.deviceId}, Type: ${t.deviceType}, Token: ${preview}...`);
        });
      });
    }

    console.log('\n✅ Cleanup complete!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   MongoDB is not running or not accessible at', process.env.MONGODB_URI);
    }
    process.exit(1);
  }
}

clearInvalidTokens();
