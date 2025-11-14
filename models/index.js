// Central export file for all models
// This file provides a single point of import for all database models

const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OTP = require('./OTP');

module.exports = {
  User,
  Restaurant,
  MenuItem,
  Order,
  OTP
};

// Alternative individual exports for convenience
module.exports.User = User;
module.exports.Restaurant = Restaurant;
module.exports.MenuItem = MenuItem;
module.exports.Order = Order;
module.exports.OTP = OTP;

// Model validation helper
const validateModels = () => {
  const models = { User, Restaurant, MenuItem, Order, OTP };

  for (const [name, model] of Object.entries(models)) {
    if (!model || typeof model !== 'function') {
      throw new Error(`Model ${name} is not properly defined`);
    }
  }

  console.log('✅ All models loaded successfully');
  return true;
};

// Export validation function
module.exports.validateModels = validateModels;

// Model relationships helper
const getModelRelationships = () => {
  return {
    User: {
      hasMany: ['Restaurant', 'Order'],
      relationships: [
        'User (restaurant role) -> Restaurant (ownerId)',
        'User (student role) -> Order (studentId)'
      ]
    },
    Restaurant: {
      belongsTo: ['User'],
      hasMany: ['MenuItem', 'Order'],
      relationships: [
        'Restaurant -> User (ownerId)',
        'Restaurant -> MenuItem (restaurantId)',
        'Restaurant -> Order (restaurantId)'
      ]
    },
    MenuItem: {
      belongsTo: ['Restaurant'],
      relationships: [
        'MenuItem -> Restaurant (restaurantId)'
      ]
    },
    Order: {
      belongsTo: ['User', 'Restaurant'],
      hasMany: ['MenuItem'],
      relationships: [
        'Order -> User (studentId)',
        'Order -> Restaurant (restaurantId)',
        'Order -> MenuItem (items.menuItemId)'
      ]
    }
  };
};

// Export relationships helper
module.exports.getModelRelationships = getModelRelationships;

// Database initialization helper
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database models...');
    
    // Validate all models are loaded
    validateModels();
    
    // Create indexes (they will be created automatically on first use)
    console.log('📊 Database indexes will be created automatically on first use');
    
    // Log model relationships
    const relationships = getModelRelationships();
    console.log('🔗 Model relationships:');
    Object.entries(relationships).forEach(([model, info]) => {
      console.log(`   ${model}:`);
      info.relationships.forEach(rel => console.log(`     - ${rel}`));
    });
    
    console.log('✅ Database models initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Database model initialization failed:', error.message);
    throw error;
  }
};

// Export initialization function
module.exports.initializeDatabase = initializeDatabase;

// Model statistics helper
const getModelStats = async () => {
  try {
    const stats = {};
    
    stats.users = await User.countDocuments();
    stats.restaurants = await Restaurant.countDocuments();
    stats.menuItems = await MenuItem.countDocuments();
    stats.orders = await Order.countDocuments();
    
    stats.activeRestaurants = await Restaurant.countDocuments({ isActive: true });
    stats.availableMenuItems = await MenuItem.countDocuments({ isAvailable: true });
    stats.pendingOrders = await Order.countDocuments({ status: 'pending' });
    stats.deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    return stats;
  } catch (error) {
    console.error('Error getting model statistics:', error.message);
    return null;
  }
};

// Export statistics function
module.exports.getModelStats = getModelStats;