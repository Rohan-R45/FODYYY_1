const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fixFCMTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with invalid FCM tokens
    const users = await User.find();
    let fixedCount = 0;

    for (const user of users) {
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        // Check for invalid tokens
        const invalidTokens = user.fcmTokens.filter(t => 
          !t.token || t.token === '0' || t.token === '0' || typeof t.token !== 'string' || t.token.trim() === ''
        );

        if (invalidTokens.length > 0) {
          console.log(`\n📍 User ${user.email}:`);
          console.log(`   Current tokens: ${user.fcmTokens.map(t => t.token).join(', ')}`);
          
          // Remove invalid tokens
          user.fcmTokens = user.fcmTokens.filter(t => 
            t.token && t.token !== '0' && typeof t.token === 'string' && t.token.trim() !== ''
          );
          
          await user.save();
          console.log(`   Removed ${invalidTokens.length} invalid token(s)`);
          console.log(`   Remaining tokens: ${user.fcmTokens.length}`);
          fixedCount++;
        }
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} users with invalid tokens`);
    
    // Show specific user if provided
    if (process.argv[2]) {
      const specificUser = await User.findById(process.argv[2]);
      if (specificUser) {
        console.log(`\n📍 Specific user ${specificUser.email}:`);
        console.log(`   FCM Tokens: ${JSON.stringify(specificUser.fcmTokens, null, 2)}`);
        console.log(`   Notification Preferences: ${JSON.stringify(specificUser.notificationPreferences, null, 2)}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

fixFCMTokens();
