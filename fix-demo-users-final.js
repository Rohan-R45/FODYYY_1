// Fix demo users - final version
require('dotenv').config();
const mongoose = require('mongoose');

async function fixDemoUsersFinal() {
  console.log('🔧 Creating working demo users (final fix)...\n');

  try {
    // Connect to database
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load User model
    const { User } = require('./models');
    console.log('✅ User model loaded');

    // Create demo users - let the model handle password hashing
    console.log('\n2️⃣ Creating demo users...');
    
    const demoUsers = [
      {
        name: 'Demo Student',
        email: 'demo@student.com',
        password: 'password123', // Plain text - model will hash it
        role: 'student',
        phone: '9876543210',
        address: 'Demo Student Address, IIT Tirupati'
      },
      {
        name: 'Demo Restaurant',
        email: 'demo@restaurant.com',
        password: 'password123', // Plain text - model will hash it
        role: 'restaurant',
        phone: '9876543211',
        address: 'Demo Restaurant, IIT Tirupati'
      }
    ];

    for (const demoUser of demoUsers) {
      try {
        // Delete existing user if exists
        await User.deleteOne({ email: demoUser.email });
        console.log(`   🗑️  Removed existing user ${demoUser.email} if any`);
        
        // Create new user - let the model hash the password automatically
        console.log(`   📝 Creating user ${demoUser.email}...`);
        const user = new User({
          name: demoUser.name,
          email: demoUser.email,
          password: demoUser.password, // Plain text password
          role: demoUser.role,
          phone: demoUser.phone,
          address: demoUser.address,
          isActive: true
        });
        
        await user.save(); // This will trigger the pre('save') middleware to hash password
        console.log(`   ✅ Created ${demoUser.email} successfully`);
        
        // Test password using the model's matchPassword method
        console.log(`   🧪 Testing password for ${demoUser.email}...`);
        const testUser = await User.findOne({ email: demoUser.email }).select('+password');
        const isPasswordValid = await testUser.matchPassword(demoUser.password);
        console.log(`   ${isPasswordValid ? '✅' : '❌'} Password test: ${isPasswordValid ? 'PASSED' : 'FAILED'}`);
        
      } catch (error) {
        console.log(`   ❌ Error creating ${demoUser.email}: ${error.message}`);
      }
    }

    // Test API login
    console.log('\n3️⃣ Testing API login...');
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const axios = require('axios');
    
    for (const demoUser of demoUsers) {
      try {
        console.log(`   🌐 Testing API login for ${demoUser.email}...`);
        
        const startTime = Date.now();
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: demoUser.email,
          password: demoUser.password
        }, {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.data.success) {
          console.log(`   ✅ API login successful for ${demoUser.email} (${responseTime}ms)`);
          console.log(`   👤 User: ${response.data.data.name}`);
          console.log(`   🎫 Token: ${response.data.data.token ? 'Received' : 'Missing'}`);
          console.log(`   📧 Email: ${response.data.data.email}`);
          console.log(`   👤 Role: ${response.data.data.role}`);
        } else {
          console.log(`   ❌ API login failed: ${response.data.message}`);
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ API login error for ${demoUser.email}:`);
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Message: ${error.response.data?.message || 'Unknown error'}`);
          
          if (error.response.status === 401) {
            console.log(`      💡 This suggests password/email mismatch`);
          } else if (error.response.status === 500) {
            console.log(`      💡 This suggests a server error - check backend logs`);
          }
        } else if (error.code === 'ECONNABORTED') {
          console.log(`   ⏱️  API login TIMEOUT for ${demoUser.email}`);
          console.log(`      🚨 This is the cause of your loading issue!`);
          console.log(`      💡 The request is taking more than 15 seconds`);
        } else if (error.code === 'ECONNREFUSED') {
          console.log(`   🔌 Server not running on port 5000`);
          console.log(`      💡 Make sure to run: node server.js`);
        } else {
          console.log(`   ❌ Network error: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Demo users setup completed!');
    console.log('\n📋 Working credentials for your frontend:');
    console.log('');
    demoUsers.forEach(user => {
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log('');
    });

    console.log('🔧 To fix the loading issue in your frontend:');
    console.log('   1. Use these exact credentials above');
    console.log('   2. Make sure backend server is running: node server.js');
    console.log('   3. Check browser network tab for request timing');
    console.log('   4. If still loading, check browser console for errors');

  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
fixDemoUsersFinal();