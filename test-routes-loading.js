// Test if routes are loading correctly
console.log('🔍 Testing routes loading...');

try {
  // Test auth routes
  console.log('1️⃣ Loading auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded successfully');
  console.log('   Type:', typeof authRoutes);
  console.log('   Has stack:', !!authRoutes.stack);
  console.log('   Stack length:', authRoutes.stack ? authRoutes.stack.length : 'No stack');
  
  if (authRoutes.stack) {
    console.log('   Routes found:');
    authRoutes.stack.forEach((layer, index) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        console.log(`     ${index + 1}. ${methods.join(', ').toUpperCase()} ${layer.route.path}`);
      }
    });
  }
  
  // Test other routes
  console.log('\n2️⃣ Loading other routes...');
  
  try {
    const restaurantRoutes = require('./routes/restaurants');
    console.log('✅ Restaurant routes loaded');
  } catch (e) {
    console.log('❌ Restaurant routes error:', e.message);
  }
  
  try {
    const menuRoutes = require('./routes/menu');
    console.log('✅ Menu routes loaded');
  } catch (e) {
    console.log('❌ Menu routes error:', e.message);
  }
  
  try {
    const orderRoutes = require('./routes/orders');
    console.log('✅ Order routes loaded');
  } catch (e) {
    console.log('❌ Order routes error:', e.message);
  }
  
  console.log('\n3️⃣ Testing models...');
  try {
    const { User } = require('./models');
    console.log('✅ User model loaded');
  } catch (e) {
    console.log('❌ User model error:', e.message);
  }
  
} catch (error) {
  console.error('❌ Error testing routes:', error.message);
  console.error('Stack trace:', error.stack);
}