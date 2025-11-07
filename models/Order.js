const mongoose = require('mongoose');

// Sub-schema for order items
const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: [true, 'Menu item ID is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Quantity cannot exceed 50 per item']
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative']
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters'],
    trim: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const user = await User.findById(v);
        return user && user.role === 'student';
      },
      message: 'Order must be placed by a student'
    }
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order must have at least one item'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  itemTotal: {
    type: Number,
    required: [true, 'Item total is required'],
    min: [0, 'Item total cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, preparing, ready, delivered, cancelled'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed'],
      message: 'Payment status must be one of: pending, paid, failed'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['UPI', 'upi', 'Card', 'card', 'Cash', 'cash', 'COD', 'cod', 'Wallet', 'wallet'],
      message: 'Payment method must be one of: UPI, Card, Cash, COD, Wallet'
    },
    default: 'UPI'
  },
  upiTransactionId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    validate: {
      validator: function(v) {
        if (this.paymentMethod === 'UPI' && this.paymentStatus === 'paid') {
          return v && v.length >= 12; // UPI transaction IDs are typically 12+ characters
        }
        return true;
      },
      message: 'UPI transaction ID is required for UPI payments and must be at least 12 characters'
    }
  },
  paymentDetails: {
    upiId: {
      type: String,
      default: 'restaurant@upi' // This would be set per restaurant
    },
    qrCode: {
      type: String // Base64 encoded QR code or URL to QR code image
    },
    transactionId: {
      type: String,
      sparse: true,
      unique: true
    },
    paidAt: {
      type: Date
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentProof: {
      type: String // URL to uploaded payment screenshot
    },
    notes: {
      type: String,
      maxlength: [500, 'Payment notes cannot exceed 500 characters']
    }
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true,
    maxlength: [300, 'Delivery address cannot exceed 300 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please add a valid phone number'
    ]
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryTime: {
    type: Date,
    validate: {
      validator: function(v) {
        if (v) {
          return v > this.orderDate;
        }
        return true;
      },
      message: 'Estimated delivery time must be after order date'
    }
  },
  actualDeliveryTime: {
    type: Date,
    validate: {
      validator: function(v) {
        if (v) {
          return v > this.orderDate;
        }
        return true;
      },
      message: 'Actual delivery time must be after order date'
    }
  },
  deliveryCharge: {
    type: Number,
    default: 0,
    min: [0, 'Delivery charge cannot be negative']
  },

  // Restaurant-specific charges (store at order time)
  gstPercentage: {
    type: Number,
    required: true,
    min: [0, 'GST percentage cannot be negative'],
    max: [18, 'GST percentage cannot exceed 18%']
  },

  gstAmount: {
    type: Number,
    required: true,
    min: [0, 'GST amount cannot be negative']
  },

  packingCharge: {
    type: Number,
    required: true,
    min: [0, 'Packing charge cannot be negative']
  },

  platformFee: {
    type: Number,
    required: true,
    min: [0, 'Platform fee cannot be negative']
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    code: {
      type: String,
      trim: true
    },
    reason: {
      type: String,
      trim: true
    }
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  rating: {
    food: {
      type: Number,
      min: [1, 'Food rating must be at least 1'],
      max: [5, 'Food rating cannot exceed 5']
    },
    delivery: {
      type: Number,
      min: [1, 'Delivery rating must be at least 1'],
      max: [5, 'Delivery rating cannot exceed 5']
    },
    overall: {
      type: Number,
      min: [1, 'Overall rating must be at least 1'],
      max: [5, 'Overall rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Rating comment cannot exceed 500 characters'],
      trim: true
    },
    ratedAt: {
      type: Date
    }
  },
  cancellationReason: {
    type: String,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters'],
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['student', 'restaurant', 'admin']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
orderSchema.index({ studentId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ estimatedDeliveryTime: 1 });

// Compound indexes
orderSchema.index({ studentId: 1, status: 1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ studentId: 1, orderDate: -1 });
orderSchema.index({ restaurantId: 1, orderDate: -1 });

// Virtual for order number (formatted)
orderSchema.virtual('orderNumber').get(function() {
  return `ORD${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for final amount (after discount and tax)
orderSchema.virtual('finalAmount').get(function() {
  return this.totalAmount + this.deliveryCharge + this.tax - this.discount.amount;
});

// Virtual for delivery status
orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

// Virtual for can cancel
orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual for can rate
orderSchema.virtual('canRate').get(function() {
  return this.status === 'delivered' && !this.rating.overall;
});

// Method to calculate estimated delivery time
orderSchema.methods.calculateEstimatedDeliveryTime = async function() {
  try {
    const Restaurant = mongoose.model('Restaurant');
    const restaurant = await Restaurant.findById(this.restaurantId);
    
    if (restaurant && restaurant.deliveryTime) {
      // Parse delivery time like "30-45 mins"
      const timeMatch = restaurant.deliveryTime.match(/(\d+)-(\d+)\s+(mins?|minutes?|hours?)/i);
      if (timeMatch) {
        const maxTime = parseInt(timeMatch[2]);
        const unit = timeMatch[3].toLowerCase();
        
        let minutes = maxTime;
        if (unit.includes('hour')) {
          minutes = maxTime * 60;
        }
        
        this.estimatedDeliveryTime = new Date(this.orderDate.getTime() + minutes * 60000);
      }
    }
    
    if (!this.estimatedDeliveryTime) {
      // Default to 45 minutes if no restaurant delivery time
      this.estimatedDeliveryTime = new Date(this.orderDate.getTime() + 45 * 60000);
    }
    
    return this.estimatedDeliveryTime;
  } catch (error) {
    // Default fallback
    this.estimatedDeliveryTime = new Date(this.orderDate.getTime() + 45 * 60000);
    return this.estimatedDeliveryTime;
  }
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, updatedBy = null) {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['delivered'],
    'delivered': [],
    'cancelled': []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot change status from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  
  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  if (newStatus === 'delivered') {
    this.actualDeliveryTime = new Date();
  }
  
  return this.save();
};

// Method to add rating
orderSchema.methods.addRating = function(ratingData) {
  if (this.status !== 'delivered') {
    throw new Error('Can only rate delivered orders');
  }
  
  if (this.rating.overall) {
    throw new Error('Order has already been rated');
  }
  
  this.rating = {
    ...ratingData,
    ratedAt: new Date()
  };
  
  return this.save();
};

// Method to confirm payment
orderSchema.methods.confirmPayment = function(transactionId, paymentProof = null) {
  if (this.paymentStatus === 'paid') {
    throw new Error('Payment has already been confirmed');
  }
  
  if (!transactionId || transactionId.length < 12) {
    throw new Error('Valid UPI transaction ID is required');
  }
  
  this.paymentStatus = 'paid';
  this.upiTransactionId = transactionId;
  this.paymentDetails.transactionId = transactionId;
  this.paymentDetails.paidAt = new Date();
  
  if (paymentProof) {
    this.paymentDetails.paymentProof = paymentProof;
  }
  
  return this.save();
};

// Method to verify payment (by restaurant/admin)
orderSchema.methods.verifyPayment = function(verifiedBy, notes = '') {
  if (this.paymentStatus !== 'paid') {
    throw new Error('Payment must be confirmed before verification');
  }
  
  if (this.paymentDetails.verifiedAt) {
    throw new Error('Payment has already been verified');
  }
  
  this.paymentDetails.verifiedAt = new Date();
  this.paymentDetails.verifiedBy = verifiedBy;
  
  if (notes) {
    this.paymentDetails.notes = notes;
  }
  
  return this.save();
};

// Static method to find orders by student
orderSchema.statics.findByStudent = function(studentId, status = null) {
  const query = { studentId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ orderDate: -1 });
};

// Static method to find orders by restaurant
orderSchema.statics.findByRestaurant = function(restaurantId, status = null) {
  const query = { restaurantId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ orderDate: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(restaurantId, startDate, endDate) {
  const matchStage = { restaurantId };
  
  if (startDate && endDate) {
    matchStage.orderDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Pre-save middleware to calculate estimated delivery time
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.estimatedDeliveryTime) {
    await this.calculateEstimatedDeliveryTime();
  }
  next();
});

// Pre-save middleware to validate items belong to restaurant
orderSchema.pre('save', async function(next) {
  if (this.isModified('items') || this.isNew) {
    try {
      const MenuItem = mongoose.model('MenuItem');
      
      for (const item of this.items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        
        if (!menuItem) {
          return next(new Error(`Menu item ${item.menuItemId} not found`));
        }
        
        if (menuItem.restaurantId.toString() !== this.restaurantId.toString()) {
          return next(new Error(`Menu item ${item.name} does not belong to this restaurant`));
        }
        
        if (!menuItem.isAvailable) {
          return next(new Error(`Menu item ${item.name} is not available`));
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', orderSchema);