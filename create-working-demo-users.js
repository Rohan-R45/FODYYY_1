// Create working demo users
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createWorkingDemoUsers() {
  console.log('🔧 Creating working demo users...\n');

  try {
    // Connect to database
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load User model
    const { User } = require('./models');
    console.log('✅ User model loaded');

    // Create demo users with correct roles
    console.log('\n2️⃣ Creating demo users...');
    
    const demoUsers = [
      {
        name: 'Demo Student',
        email: 'demo@student.com',
        password: 'password123',
        role: 'student',
        phone: '9876543210',
        address: 'Demo Student Address, IIT Tirupati'
      },
      {
        name: 'Demo Restaurant',
        email: 'demo@restaurant.com',
        password: 'password123',
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
        
        // Hash password properly
        console.log(`   🔐 Hashing password for ${demoUser.email}...`);
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(demoUser.password, saltRounds);
        console.log(`   ✅ Password hashed successfully`);
        
        // Create new user
        console.log(`   📝 Creating user ${demoUser.email}...`);
        const user = new User({
          name: demoUser.name,
          email: demoUser.email,
          password: hashedPassword,
          role: demoUser.role,
          phone: demoUser.phone,
          address: demoUser.address,
          isActive: true
        });
        
        await user.save();
        console.log(`   ✅ Created ${demoUser.email} successfully`);
        
        // Test password immediately
        console.log(`   🧪 Testing password for ${demoUser.email}...`);
        const testUser = await User.findOne({ email: demoUser.email }).select('+password');
        const isPasswordValid = await bcrypt.compare(demoUser.password, testUser.password);
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
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: demoUser.email,
          password: demoUser.password
        }, {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          console.log(`   ✅ API login successful for ${demoUser.email}`);
          console.log(`   👤 User: ${response.data.data.name}`);
          console.log(`   🎫 Token: ${response.data.data.token ? 'Received' : 'Missing'}`);
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
          }
        } else if (error.code === 'ECONNABORTED') {
          console.log(`   ⏱️  API login TIMEOUT for ${demoUser.email}`);
          console.log(`      🚨 This is likely the cause of your loading issue!`);
          console.log(`      💡 The request is taking too long to respond`);
        } else if (error.code === 'ECONNREFUSED') {
          console.log(`   🔌 Server not running on port 5000`);
        } else {
          console.log(`   ❌ Network error: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\n📋 Working credentials for your frontend:');
    console.log('');
    demoUsers.forEach(user => {
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📱 Phone: ${user.phone}`);
      console.log('');
    });

    console.log('💡 If login is still loading/hanging:');
    console.log('   1. Check if backend server is running properly');
    console.log('   2. Check browser network tab for request status');
    console.log('   3. Look for timeout errors in browser console');
    console.log('   4. Verify CORS settings allow your frontend origin');

  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createWorkingDemoUsers();