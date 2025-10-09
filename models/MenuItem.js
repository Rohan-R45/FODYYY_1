const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Menu item must belong to a restaurant']
  },
  name: {
    type: String,
    required: [true, 'Please add menu item name'],
    trim: true,
    maxlength: [100, 'Menu item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot be more than 300 characters'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add menu item price'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        // Allow up to 2 decimal places for price
        return Number.isInteger(v * 100);
      },
      message: 'Price must have at most 2 decimal places'
    }
  },
  category: {
    type: String,
    required: [true, 'Please add menu item category'],
    enum: {
      values: ['Appetizer', 'Main Course', 'Dessert', 'Beverages', 'Snacks'],
      message: 'Category must be one of: Appetizer, Main Course, Dessert, Beverages, Snacks'
    }
  },
  image: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        
        // Check if it's a valid URL
        try {
          const url = new URL(v);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
          }
        } catch (e) {
          return false;
        }
        
        // Check for common image hosting services or file extensions
        const imageHosts = ['cloudinary', 'imgur', 'unsplash', 'pexels', 'pixabay', 'flickr', 'imagekit', 'cloudflare', 'amazonaws'];
        const hasImageHost = imageHosts.some(host => v.toLowerCase().includes(host));
        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(v);
        
        return hasImageHost || hasImageExtension;
      },
      message: 'Please provide a valid image URL'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  },
  ingredients: {
    type: [String],
    default: []
  },
  allergens: {
    type: [String],
    enum: {
      values: ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Sesame'],
      message: 'Invalid allergen type'
    },
    default: []
  },
  nutritionalInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative']
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative']
    }
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: {
      values: ['Mild', 'Medium', 'Hot', 'Extra Hot', 'Not Applicable'],
      message: 'Spice level must be one of: Mild, Medium, Hot, Extra Hot, Not Applicable'
    },
    default: 'Not Applicable'
  },
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    validUntil: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ isVegetarian: 1 });
menuItemSchema.index({ isVegan: 1 });
menuItemSchema.index({ createdAt: -1 });

// Compound indexes
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });

// Virtual for discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount.percentage > 0 && this.discount.validUntil && this.discount.validUntil > new Date()) {
    const discountAmount = (this.price * this.discount.percentage) / 100;
    return Math.round((this.price - discountAmount) * 100) / 100;
  }
  return this.price;
});

// Virtual for effective price (considering discount)
menuItemSchema.virtual('effectivePrice').get(function() {
  return this.discountedPrice;
});

// Virtual to check if discount is active
menuItemSchema.virtual('hasActiveDiscount').get(function() {
  return this.discount.percentage > 0 && 
         this.discount.validUntil && 
         this.discount.validUntil > new Date();
});

// Method to check availability
menuItemSchema.methods.checkAvailability = function() {
  return this.isAvailable;
};

// Method to apply discount
menuItemSchema.methods.applyDiscount = function(percentage, validUntil) {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  
  this.discount.percentage = percentage;
  this.discount.validUntil = validUntil;
  
  return this.save();
};

// Static method to find available items by restaurant
menuItemSchema.statics.findAvailableByRestaurant = function(restaurantId) {
  return this.find({ 
    restaurantId: restaurantId, 
    isAvailable: true 
  }).sort({ category: 1, name: 1 });
};

// Static method to find items by category
menuItemSchema.statics.findByCategory = function(restaurantId, category) {
  return this.find({ 
    restaurantId: restaurantId, 
    category: category,
    isAvailable: true 
  }).sort({ name: 1 });
};

// Static method to search menu items
menuItemSchema.statics.searchItems = function(restaurantId, query) {
  return this.find({
    restaurantId: restaurantId,
    isAvailable: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { ingredients: { $in: [new RegExp(query, 'i')] } }
    ]
  });
};

// Pre-save middleware to validate restaurant exists
menuItemSchema.pre('save', async function(next) {
  if (this.isModified('restaurantId')) {
    try {
      const Restaurant = mongoose.model('Restaurant');
      const restaurant = await Restaurant.findById(this.restaurantId);
      
      if (!restaurant) {
        return next(new Error('Restaurant not found'));
      }
      
      if (!restaurant.isActive) {
        return next(new Error('Cannot add menu items to inactive restaurant'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-save middleware to validate vegan items are also vegetarian
menuItemSchema.pre('save', function(next) {
  if (this.isVegan && !this.isVegetarian) {
    this.isVegetarian = true; // Vegan items are automatically vegetarian
  }
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);