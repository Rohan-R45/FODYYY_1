const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Function to decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Manual decoding of common HTML entities
  return text
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3A;/g, ':')
    .replace(/&#x3F;/g, '?')
    .replace(/&#x3D;/g, '=')
    .replace(/&#x26;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
};

async function fixEncodedUrls() {
  try {
    console.log('🔧 Starting to fix encoded URLs...\n');

    // Fix MenuItem images
    console.log('📋 Checking menu items...');
    const menuItems = await MenuItem.find({});
    let menuItemsFixed = 0;

    for (const item of menuItems) {
      if (item.image && (item.image.includes('&#x') || item.image.includes('&amp;'))) {
        const decodedImage = decodeHtmlEntities(item.image);
        console.log(`  Fixing: ${item.name}`);
        console.log(`    Before: ${item.image.substring(0, 80)}...`);
        console.log(`    After:  ${decodedImage.substring(0, 80)}...`);
        
        item.image = decodedImage;
        await item.save({ validateBeforeSave: false });
        menuItemsFixed++;
      }
    }

    console.log(`\n✅ Fixed ${menuItemsFixed} menu item images\n`);

    // Fix Restaurant logos
    console.log('🏪 Checking restaurants...');
    const restaurants = await Restaurant.find({});
    let restaurantsFixed = 0;

    for (const restaurant of restaurants) {
      if (restaurant.image && (restaurant.image.includes('&#x') || restaurant.image.includes('&amp;'))) {
        const decodedImage = decodeHtmlEntities(restaurant.image);
        console.log(`  Fixing: ${restaurant.name}`);
        console.log(`    Before: ${restaurant.image.substring(0, 80)}...`);
        console.log(`    After:  ${decodedImage.substring(0, 80)}...`);
        
        restaurant.image = decodedImage;
        await restaurant.save({ validateBeforeSave: false });
        restaurantsFixed++;
      }
    }

    console.log(`\n✅ Fixed ${restaurantsFixed} restaurant logos\n`);

    console.log('🎉 All done! URLs have been decoded.');
    console.log(`   Total menu items fixed: ${menuItemsFixed}`);
    console.log(`   Total restaurants fixed: ${restaurantsFixed}`);

  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the fix
fixEncodedUrls();