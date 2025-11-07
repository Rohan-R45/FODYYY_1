const express = require('express');
const { Restaurant, User, MenuItem } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { createValidator } = require('../middleware/validation');

const router = express.Router();

// Validation rules for restaurant creation/update
const restaurantValidationRules = {
  name: (value) => {
    if (!value || value.trim().length < 2) {
      return 'Restaurant name must be at least 2 characters long';
    }
    if (value.length > 100) {
      return 'Restaurant name cannot exceed 100 characters';
    }
    return null;
  },
  description: (value) => {
    if (value && value.length > 500) {
      return 'Description cannot exceed 500 characters';
    }
    return null;
  },
  address: (value) => {
    if (!value || value.trim().length < 10) {
      return 'Address must be at least 10 characters long';
    }
    if (value.length > 200) {
      return 'Address cannot exceed 200 characters';
    }
    return null;
  },
  phone: (value) => {
    if (!value) {
      return 'Phone number is required';
    }
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return 'Phone number must be between 10-15 digits';
    }
    return null;
  },
  deliveryTime: (value) => {
    if (value && !/^\d+-\d+\s+(mins|minutes|hours?)$/i.test(value)) {
      return 'Delivery time must be in format "30-45 mins" or "1-2 hours"';
    }
    return null;
  },
  cuisine: (value) => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return 'At least one cuisine type is required';
    }
    return null;
  }
};

// Middleware to check restaurant ownership
const checkRestaurantOwnership = async (req, res, next) => {
  try {
    // Validate ID format before querying database
    const restaurantId = req.params.id;
    if (!restaurantId || typeof restaurantId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if the authenticated user owns this restaurant
    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage your own restaurant'
      });
    }

    // Attach restaurant to request for use in route handler
    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Restaurant ownership check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking restaurant ownership',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Health check for restaurants service
// @route   GET /api/restaurants/health
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurants service is healthy',
    timestamp: new Date().toISOString()
  });
});

// @desc    Get all active restaurants
// @route   GET /api/restaurants
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      cuisine,
      sortBy = 'rating',
      sortOrder = 'desc',
      minRating,
      maxRating,
      priceRange
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisine: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by cuisine
    if (cuisine) {
      const cuisineArray = cuisine.split(',');
      query.cuisine = { $in: cuisineArray };
    }

    // Filter by rating range
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    // Filter by price range
    if (priceRange) {
      query.priceRange = priceRange;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Restaurant.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Add menu items count to each restaurant
    const restaurantsWithMenuCount = await Promise.all(
      restaurants.map(async (restaurant) => {
        const menuItemsCount = await MenuItem.countDocuments({
          restaurantId: restaurant._id,
          isAvailable: true
        });
        
        return {
          ...restaurant,
          menuItemsCount
        };
      })
    );

    res.json({
      success: true,
      message: 'Restaurants retrieved successfully',
      data: restaurantsWithMenuCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurants',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Get my restaurant (for authenticated restaurant owner)
// @route   GET /api/restaurants/my-restaurant
// @access  Private (Restaurant owners only)
router.get('/my-restaurant',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      // Find restaurant by owner ID
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id })
        .populate('ownerId', 'name email phone')
        .lean();

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found. Please complete your restaurant setup.',
          requiresSetup: true,
          data: null
        });
      }

      // Get additional stats
      const menuItemsCount = await MenuItem.countDocuments({
        restaurantId: restaurant._id
      });

      const availableMenuItemsCount = await MenuItem.countDocuments({
        restaurantId: restaurant._id,
        isAvailable: true
      });

      // Add stats to restaurant data
      const restaurantWithStats = {
        ...restaurant,
        menuItemsCount,
        availableMenuItemsCount
      };

      res.json({
        success: true,
        message: 'Restaurant retrieved successfully',
        data: restaurantWithStats
      });

    } catch (error) {
      console.error('Get my restaurant error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve restaurant',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get restaurant profile for authenticated restaurant owner
// @route   GET /api/restaurants/profile
// @access  Private (Restaurant owners only)
router.get('/profile',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      // Find restaurant by owner ID
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id })
        .populate('ownerId', 'name email phone')
        .lean();

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant profile not found. Please create your restaurant profile first.',
          requiresSetup: true
        });
      }

      // Get menu items count
      const menuItemsCount = await MenuItem.countDocuments({
        restaurantId: restaurant._id
      });

      // Get available menu items count
      const availableMenuItemsCount = await MenuItem.countDocuments({
        restaurantId: restaurant._id,
        isAvailable: true
      });

      // Add additional stats to restaurant data
      const restaurantWithStats = {
        ...restaurant,
        menuItemsCount,
        availableMenuItemsCount
      };

      res.json({
        success: true,
        message: 'Restaurant profile retrieved successfully',
        data: restaurantWithStats
      });

    } catch (error) {
      console.error('Get restaurant profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve restaurant profile',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Update restaurant profile for authenticated restaurant owner
// @route   PUT /api/restaurants/profile
// @access  Private (Restaurant owners only)
router.put('/profile',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      const { name, description, address, phone, image, deliveryTime, cuisine, priceRange, deliveryCharge, gstPercentage, packingCharge, platformFee, isClosed } = req.body;

      // Find restaurant by owner ID
      let restaurant = await Restaurant.findOne({ ownerId: req.user._id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant profile not found. Please create your restaurant profile first.',
          requiresSetup: true
        });
      }

      // Validate fields if provided
      const errors = [];
      
      if (name !== undefined) {
        const nameError = restaurantValidationRules.name(name);
        if (nameError) errors.push({ field: 'name', message: nameError });
        
        // Check if new name is already taken by another restaurant
        if (name !== restaurant.name) {
          const nameExists = await Restaurant.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: restaurant._id }
          });
          if (nameExists) {
            errors.push({ field: 'name', message: 'Restaurant name is already taken' });
          }
        }
      }

      if (description !== undefined) {
        const descError = restaurantValidationRules.description(description);
        if (descError) errors.push({ field: 'description', message: descError });
      }

      if (address !== undefined) {
        const addressError = restaurantValidationRules.address(address);
        if (addressError) errors.push({ field: 'address', message: addressError });
      }

      if (phone !== undefined) {
        const phoneError = restaurantValidationRules.phone(phone);
        if (phoneError) errors.push({ field: 'phone', message: phoneError });
      }

      if (deliveryTime !== undefined) {
        const deliveryError = restaurantValidationRules.deliveryTime(deliveryTime);
        if (deliveryError) errors.push({ field: 'deliveryTime', message: deliveryError });
      }

      if (cuisine !== undefined) {
        const cuisineError = restaurantValidationRules.cuisine(cuisine);
        if (cuisineError) errors.push({ field: 'cuisine', message: cuisineError });
      }

      if (deliveryCharge !== undefined) {
        if (typeof deliveryCharge !== 'number') {
          errors.push({ field: 'deliveryCharge', message: 'Delivery charge must be a number' });
        } else if (deliveryCharge < 0) {
          errors.push({ field: 'deliveryCharge', message: 'Delivery charge cannot be negative' });
        } else if (!Number.isFinite(deliveryCharge)) {
          errors.push({ field: 'deliveryCharge', message: 'Delivery charge must be a valid number' });
        }
      }

      if (gstPercentage !== undefined) {
        if (typeof gstPercentage !== 'number') {
          errors.push({ field: 'gstPercentage', message: 'GST percentage must be a number' });
        } else if (gstPercentage < 0 || gstPercentage > 18) {
          errors.push({ field: 'gstPercentage', message: 'GST percentage must be between 0% and 18%' });
        } else if (!Number.isFinite(gstPercentage)) {
          errors.push({ field: 'gstPercentage', message: 'GST percentage must be a valid number' });
        }
      }

      if (packingCharge !== undefined) {
        if (typeof packingCharge !== 'number') {
          errors.push({ field: 'packingCharge', message: 'Packing charge must be a number' });
        } else if (packingCharge < 0) {
          errors.push({ field: 'packingCharge', message: 'Packing charge cannot be negative' });
        } else if (!Number.isFinite(packingCharge)) {
          errors.push({ field: 'packingCharge', message: 'Packing charge must be a valid number' });
        }
      }

      if (platformFee !== undefined) {
        if (typeof platformFee !== 'number') {
          errors.push({ field: 'platformFee', message: 'Platform fee must be a number' });
        } else if (platformFee < 0) {
          errors.push({ field: 'platformFee', message: 'Platform fee cannot be negative' });
        } else if (!Number.isFinite(platformFee)) {
          errors.push({ field: 'platformFee', message: 'Platform fee must be a valid number' });
        }
      }

      if (isClosed !== undefined) {
        if (typeof isClosed !== 'boolean') {
          errors.push({ field: 'isClosed', message: 'isClosed must be a boolean value' });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      // Update restaurant fields
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (description !== undefined) updateFields.description = description;
      if (address !== undefined) updateFields.address = address;
      if (phone !== undefined) updateFields.phone = phone;
      if (image !== undefined) updateFields.image = image;
      if (deliveryTime !== undefined) updateFields.deliveryTime = deliveryTime;
      if (cuisine !== undefined) updateFields.cuisine = Array.isArray(cuisine) ? cuisine : [cuisine];
      if (priceRange !== undefined) updateFields.priceRange = priceRange;
      if (deliveryCharge !== undefined) updateFields.deliveryCharge = deliveryCharge;
      if (gstPercentage !== undefined) updateFields.gstPercentage = gstPercentage;
      if (packingCharge !== undefined) updateFields.packingCharge = packingCharge;
      if (platformFee !== undefined) updateFields.platformFee = platformFee;
      if (isClosed !== undefined) updateFields.isClosed = isClosed;

      // Update restaurant
      restaurant = await Restaurant.findByIdAndUpdate(
        restaurant._id,
        updateFields,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name email phone');

      console.log(`✅ Restaurant profile updated: ${restaurant.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Restaurant profile updated successfully',
        data: restaurant
      });

    } catch (error) {
      console.error('Update restaurant profile error:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update restaurant profile',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get single restaurant with menu items
// @route   GET /api/restaurants/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate ID format before querying database
    const restaurantId = req.params.id;
    if (!restaurantId || typeof restaurantId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId)
      .populate('ownerId', 'name email phone')
      .lean();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (!restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant is currently inactive'
      });
    }

    // Get menu items grouped by category
    const menuItems = await MenuItem.find({
      restaurantId: req.params.id,
      isAvailable: true
    }).sort({ category: 1, name: 1 });

    // Group menu items by category
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Get restaurant statistics
    const stats = {
      totalMenuItems: menuItems.length,
      categoriesCount: Object.keys(menuByCategory).length,
      averagePrice: menuItems.length > 0 
        ? Math.round((menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length) * 100) / 100
        : 0
    };

    // Include delivery settings in restaurant payload if present (for student checkout to pick up latest fees)
    res.json({
      success: true,
      message: 'Restaurant details retrieved successfully',
      data: {
        restaurant,
        menuItems: menuByCategory,
        stats
      }
    });

  } catch (error) {
    console.error('Get restaurant error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant details',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Create restaurant profile
// @route   POST /api/restaurants
// @access  Private (Restaurant owners only)
router.post('/',
  protect,
  authorize('restaurant'),
  createValidator(restaurantValidationRules),
  async (req, res) => {
    try {
      const { name, description, address, phone, image, deliveryTime, cuisine, priceRange } = req.body;

      // Check if user already has a restaurant
      const existingRestaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (existingRestaurant) {
        return res.status(409).json({
          success: false,
          message: 'You already have a restaurant profile. Use PUT to update it.'
        });
      }

      // Check if restaurant name is already taken
      const nameExists = await Restaurant.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'Restaurant name is already taken',
          field: 'name'
        });
      }

      // Create restaurant
      const restaurant = await Restaurant.create({
        ownerId: req.user._id,
        name,
        description,
        address,
        phone,
        image: image || '',
        deliveryTime: deliveryTime || '30-45 mins',
        cuisine: Array.isArray(cuisine) ? cuisine : [cuisine],
        priceRange: priceRange || '$$'
      });

      // Populate owner information
      await restaurant.populate('ownerId', 'name email phone');

      console.log(`✅ Restaurant created: ${name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Restaurant profile created successfully',
        data: restaurant
      });

    } catch (error) {
      console.error('Create restaurant error:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create restaurant profile',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Owner only)
router.put('/:id',
  protect,
  authorize('restaurant'),
  checkRestaurantOwnership,
  async (req, res) => {
    try {
      const { name, description, address, phone, image, deliveryTime, cuisine, priceRange } = req.body;
      const restaurant = req.restaurant;

      // Validate fields if provided
      const errors = [];
      
      if (name !== undefined) {
        const nameError = restaurantValidationRules.name(name);
        if (nameError) errors.push({ field: 'name', message: nameError });
        
        // Check if new name is already taken by another restaurant
        if (name !== restaurant.name) {
          const nameExists = await Restaurant.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: restaurant._id }
          });
          if (nameExists) {
            errors.push({ field: 'name', message: 'Restaurant name is already taken' });
          }
        }
      }

      if (description !== undefined) {
        const descError = restaurantValidationRules.description(description);
        if (descError) errors.push({ field: 'description', message: descError });
      }

      if (address !== undefined) {
        const addressError = restaurantValidationRules.address(address);
        if (addressError) errors.push({ field: 'address', message: addressError });
      }

      if (phone !== undefined) {
        const phoneError = restaurantValidationRules.phone(phone);
        if (phoneError) errors.push({ field: 'phone', message: phoneError });
      }

      if (deliveryTime !== undefined) {
        const timeError = restaurantValidationRules.deliveryTime(deliveryTime);
        if (timeError) errors.push({ field: 'deliveryTime', message: timeError });
      }

      if (cuisine !== undefined) {
        const cuisineError = restaurantValidationRules.cuisine(cuisine);
        if (cuisineError) errors.push({ field: 'cuisine', message: cuisineError });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      // Build update object
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (image !== undefined) updateData.image = image;
      if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
      if (cuisine !== undefined) updateData.cuisine = Array.isArray(cuisine) ? cuisine : [cuisine];
      if (priceRange !== undefined) updateData.priceRange = priceRange;

      // Update restaurant
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurant._id,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name email phone');

      console.log(`✅ Restaurant updated: ${updatedRestaurant.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Restaurant updated successfully',
        data: updatedRestaurant
      });

    } catch (error) {
      console.error('Update restaurant error:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update restaurant',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Deactivate restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner only)
router.delete('/:id',
  protect,
  authorize('restaurant'),
  checkRestaurantOwnership,
  async (req, res) => {
    try {
      const restaurant = req.restaurant;

      // Soft delete - deactivate instead of removing
      restaurant.isActive = false;
      await restaurant.save();

      // Also deactivate all menu items
      await MenuItem.updateMany(
        { restaurantId: restaurant._id },
        { isAvailable: false }
      );

      console.log(`✅ Restaurant deactivated: ${restaurant.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Restaurant deactivated successfully',
        data: {
          restaurantId: restaurant._id,
          name: restaurant.name,
          isActive: restaurant.isActive
        }
      });

    } catch (error) {
      console.error('Deactivate restaurant error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate restaurant',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Reactivate restaurant
// @route   PATCH /api/restaurants/:id/reactivate
// @access  Private (Owner only)
router.patch('/:id/reactivate',
  protect,
  authorize('restaurant'),
  checkRestaurantOwnership,
  async (req, res) => {
    try {
      const restaurant = req.restaurant;

      // Reactivate restaurant
      restaurant.isActive = true;
      await restaurant.save();

      console.log(`✅ Restaurant reactivated: ${restaurant.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Restaurant reactivated successfully',
        data: {
          restaurantId: restaurant._id,
          name: restaurant.name,
          isActive: restaurant.isActive
        }
      });

    } catch (error) {
      console.error('Reactivate restaurant error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reactivate restaurant',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get restaurant statistics
// @route   GET /api/restaurants/:id/stats
// @access  Private (Owner only)
router.get('/:id/stats',
  protect,
  authorize('restaurant'),
  checkRestaurantOwnership,
  async (req, res) => {
    try {
      const restaurant = req.restaurant;

      // Get menu items statistics
      const menuStats = await MenuItem.aggregate([
        { $match: { restaurantId: restaurant._id } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            availableItems: { $sum: { $cond: ['$isAvailable', 1, 0] } },
            averagePrice: { $avg: '$price' },
            categories: { $addToSet: '$category' }
          }
        }
      ]);

      const stats = {
        restaurant: {
          name: restaurant.name,
          rating: restaurant.rating,
          totalRatings: restaurant.totalRatings,
          isActive: restaurant.isActive,
          createdAt: restaurant.createdAt
        },
        menu: menuStats[0] ? {
          totalItems: menuStats[0].totalItems,
          availableItems: menuStats[0].availableItems,
          averagePrice: Math.round((menuStats[0].averagePrice || 0) * 100) / 100,
          categoriesCount: menuStats[0].categories.length,
          categories: menuStats[0].categories
        } : {
          totalItems: 0,
          availableItems: 0,
          averagePrice: 0,
          categoriesCount: 0,
          categories: []
        }
      };

      res.json({
        success: true,
        message: 'Restaurant statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      console.error('Get restaurant stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve restaurant statistics',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

module.exports = router;