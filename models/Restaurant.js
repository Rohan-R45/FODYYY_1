const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant must have an owner'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const user = await User.findById(v);
        return user && user.role === 'restaurant';
      },
      message: 'Owner must be a user with restaurant role'
    }
  },
  name: {
    type: String,
    required: [true, 'Please add restaurant name'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add restaurant address'],
    trim: true,
    maxlength: [200, 'Address cannot be more than 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add restaurant phone number'],
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please add a valid phone number'
    ]
  },
  image: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        // Basic URL validation
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryTime: {
    type: String,
    default: '30-45 mins',
    validate: {
      validator: function(v) {
        // Validate format like "30-45 mins" or "1-2 hours"
        return /^\d+-\d+\s+(mins|minutes|hours?)$/i.test(v);
      },
      message: 'Delivery time must be in format "30-45 mins" or "1-2 hours"'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    validate: {
      validator: function(v) {
        // Allow up to 1 decimal place
        return Number.isInteger(v * 10);
      },
      message: 'Rating must have at most 1 decimal place'
    }
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings cannot be negative']
  },
  cuisine: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Restaurant must have at least one cuisine type'
    }
  },
  priceRange: {
    type: String,
    enum: {
      values: ['$', '$$', '$$$', '$$$$'],
      message: 'Price range must be $, $$, $$$, or $$$$'
    },
    default: '$$'
  },
  paymentDetails: {
    upiId: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          // Basic UPI ID validation (user@bank or phone@bank)
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(v);
        },
        message: 'Please provide a valid UPI ID'
      }
    },
    qrCodeImage: {
      type: String, // URL to QR code image
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Please provide a valid QR code image URL'
      }
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
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
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ createdAt: -1 });
restaurantSchema.index({ cuisine: 1 });

// Virtual for menu items
restaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurantId'
});

// Virtual for orders
restaurantSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'restaurantId'
});

// Virtual for average rating calculation
restaurantSchema.virtual('averageRating').get(function() {
  if (this.totalRatings === 0) return 0;
  return Math.round(this.rating * 10) / 10; // Round to 1 decimal place
});

// Method to update rating
restaurantSchema.methods.updateRating = async function(newRating) {
  if (newRating < 0 || newRating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }
  
  const totalScore = this.rating * this.totalRatings;
  this.totalRatings += 1;
  this.rating = (totalScore + newRating) / this.totalRatings;
  
  return await this.save();
};

// Static method to find active restaurants
restaurantSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to search restaurants
restaurantSchema.statics.searchRestaurants = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { cuisine: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  });
};

// Pre-save middleware to ensure owner exists and has correct role
restaurantSchema.pre('save', async function(next) {
  if (this.isModified('ownerId')) {
    try {
      const User = mongoose.model('User');
      const owner = await User.findById(this.ownerId);
      
      if (!owner) {
        return next(new Error('Restaurant owner not found'));
      }
      
      if (owner.role !== 'restaurant') {
        return next(new Error('Owner must have restaurant role'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);