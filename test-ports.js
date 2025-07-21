// Test script to verify port configuration
const axios = require('axios');

async function testPorts() {
  console.log('🧪 Testing port configuration...\n');
  
  // Test backend server
  try {
    const backendResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend server (port 5000): WORKING');
    console.log(`   Status: ${backendResponse.data.status}`);
    console.log(`   Environment: ${backendResponse.data.environment}\n`);
  } catch (error) {
    console.log('❌ Backend server (port 5000): NOT WORKING');
    console.log(`   Error: ${error.message}\n`);
  }
  
  // Test frontend dev server on port 5174
  try {
    const response = await axios.get('http://localhost:5174');
    console.log('✅ Frontend dev server (port 5174): WORKING');
    console.log(`   Response size: ${response.data.length} bytes\n`);
  } catch (error) {
    console.log('❌ Frontend dev server (port 5174): NOT WORKING');
    console.log(`   Error: ${error.message}\n`);
  }
  
  // Test that port 5173 is NOT in use
  try {
    await axios.get('http://localhost:5173');
    console.log('⚠️  Port 5173: STILL RUNNING (should be free!)');
  } catch (error) {
    console.log('✅ Port 5173: FREE (as expected)');
  }
  
  // Test that port 5175 is ready for use
  try {
    await axios.get('http://localhost:5175');
    console.log('⚠️  Port 5175: ALREADY IN USE');
  } catch (error) {
    console.log('✅ Port 5175: FREE (ready for alternative use)');
  }
  
  console.log('\n🎉 Port configuration test completed!');
}

testPorts().catch(console.error);