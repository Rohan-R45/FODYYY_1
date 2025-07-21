// Simple MongoDB connection test
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 Testing MongoDB Atlas connection...\n');

// Show the connection string (with password hidden)
const connectionString = process.env.MONGODB_URI;
if (connectionString) {
  const hiddenPassword = connectionString.replace(/:([^@]+)@/, ':****@');
  console.log('📡 Connection string:', hiddenPassword);
} else {
  console.log('❌ No MONGODB_URI found in .env file');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('\n🔄 Attempting to connect...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n✅ CONNECTION SUCCESSFUL!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Ready State: ${conn.connection.readyState}`);
    
    // Test a simple operation
    console.log('\n🔍 Testing database operations...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed successfully');
    console.log('\n🎉 Your MongoDB Atlas setup is working perfectly!');
    
  } catch (error) {
    console.log('\n❌ CONNECTION FAILED');
    console.log(`   Error: ${error.message}`);
    
    // Provide specific troubleshooting advice
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.log('\n💡 AUTHENTICATION ISSUE:');
      console.log('   1. Check your username and password in MongoDB Atlas');
      console.log('   2. Make sure the database user exists and has proper permissions');
      console.log('   3. Verify your password doesn\'t contain special characters that need URL encoding');
      console.log('   4. See MONGODB_TROUBLESHOOTING.md for detailed steps');
      
    } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
      console.log('\n💡 NETWORK ACCESS ISSUE:');
      console.log('   1. Add your IP address to MongoDB Atlas Network Access');
      console.log('   2. For development, you can allow access from anywhere (0.0.0.0/0)');
      console.log('   3. Network changes take 1-2 minutes to take effect');
      
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('\n💡 CONNECTION ISSUE:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the cluster URL is correct');
      console.log('   3. Try connecting from a different network');
      
    } else {
      console.log('\n💡 GENERAL TROUBLESHOOTING:');
      console.log('   1. Double-check your connection string format');
      console.log('   2. Make sure you have the database name in the URL');
      console.log('   3. See MONGODB_TROUBLESHOOTING.md for more help');
    }
    
    console.log('\n📖 For detailed troubleshooting, see:');
    console.log('   • MONGODB_TROUBLESHOOTING.md');
    console.log('   • MONGODB_SETUP.md');
  }
}

// Run the test
testConnection();