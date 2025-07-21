// Test models loading
console.log('🔍 Testing models loading...');

try {
  console.log('1️⃣ Loading models...');
  const models = require('./models');
  console.log('✅ Models loaded');
  console.log('   Available models:', Object.keys(models));
  
  const { User } = models;
  console.log('✅ User model extracted');
  console.log('   User model type:', typeof User);
  console.log('   User model name:', User.modelName);
  
  // Test other models
  const { Restaurant, MenuItem, Order } = models;
  console.log('✅ Other models extracted');
  console.log('   Restaurant:', typeof Restaurant);
  console.log('   MenuItem:', typeof MenuItem);
  console.log('   Order:', typeof Order);
  
} catch (error) {
  console.error('❌ Error testing models:', error.message);
  console.error('Stack trace:', error.stack);
}