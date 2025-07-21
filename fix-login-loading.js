// Fix login loading issue
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixLoginLoading() {
  console.log('🔧 Fixing login loading issue...\n');

  try {
    // Connect to database
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load User model
    const { User } = require('./models');
    console.log('✅ User model loaded');

    // Check existing users
    console.log('\n2️⃣ Checking existing users...');
    const users = await User.find({}).select('name email role isActive createdAt');
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    // Create/update demo users with known passwords
    console.log('\n3️⃣ Creating/updating demo users...');
    
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
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543211',
        address: 'Admin Office, IIT Tirupati'
      },
      {
        name: 'Demo Restaurant',
        email: 'restaurant@demo.com',
        password: 'restaurant123',
        role: 'restaurant',
        phone: '9876543212',
        address: 'Demo Restaurant, IIT Tirupati'
      }
    ];

    for (const demoUser of demoUsers) {
      try {
        // Check if user exists
        let user = await User.findOne({ email: demoUser.email });
        
        if (user) {
          console.log(`   ℹ️  User ${demoUser.email} already exists, updating password...`);
          // Update password
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(demoUser.password, salt);
          user.isActive = true;
          await user.save();
          console.log(`   ✅ Updated ${demoUser.email}`);
        } else {
          console.log(`   📝 Creating new user ${demoUser.email}...`);
          // Create new user
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(demoUser.password, salt);
          
          user = new User({
            ...demoUser,
            password: hashedPassword,
            isActive: true
          });
          
          await user.save();
          console.log(`   ✅ Created ${demoUser.email}`);
        }
      } catch (error) {
        console.log(`   ❌ Error with ${demoUser.email}: ${error.message}`);
      }
    }

    // Test login functionality
    console.log('\n4️⃣ Testing login functionality...');
    
    for (const demoUser of demoUsers) {
      try {
        console.log(`   🔐 Testing login for ${demoUser.email}...`);
        
        // Find user
        const user = await User.findOne({ email: demoUser.email });
        if (!user) {
          console.log(`   ❌ User not found: ${demoUser.email}`);
          continue;
        }

        // Check password
        const isMatch = await bcrypt.compare(demoUser.password, user.password);
        if (!isMatch) {
          console.log(`   ❌ Password mismatch for ${demoUser.email}`);
          continue;
        }

        // Check if user is active
        if (!user.isActive) {
          console.log(`   ❌ User inactive: ${demoUser.email}`);
          continue;
        }

        console.log(`   ✅ Login test successful for ${demoUser.email}`);
        
      } catch (error) {
        console.log(`   ❌ Login test failed for ${demoUser.email}: ${error.message}`);
      }
    }

    // Test API endpoint
    console.log('\n5️⃣ Testing API login endpoint...');
    
    const axios = require('axios');
    
    for (const demoUser of demoUsers.slice(0, 1)) { // Test just the first one
      try {
        console.log(`   🌐 Testing API login for ${demoUser.email}...`);
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: demoUser.email,
          password: demoUser.password
        }, {
          timeout: 10000 // 10 second timeout
        });

        if (response.data.success) {
          console.log(`   ✅ API login successful for ${demoUser.email}`);
          console.log(`   📋 Response: ${response.data.message}`);
          console.log(`   🎫 Token received: ${!!response.data.data.token}`);
        } else {
          console.log(`   ❌ API login failed: ${response.data.message}`);
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ API login error for ${demoUser.email}:`);
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Message: ${error.response.data.message}`);
        } else if (error.code === 'ECONNABORTED') {
          console.log(`   ⏱️  API login timeout for ${demoUser.email} - this might be the loading issue!`);
        } else {
          console.log(`   ❌ API connection error: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Demo users setup completed!');
    console.log('\n📋 You can now use these credentials:');
    demoUsers.forEach(user => {
      console.log(`   • Email: ${user.email}`);
      console.log(`     Password: ${user.password}`);
      console.log(`     Role: ${user.role}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error fixing login:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixLoginLoading();