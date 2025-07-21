const express = require('express');
const { MenuItem, Restaurant } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { createValidator } = require('../middleware/validation');

const router = express.Router();

// Validation rules for menu items
const menuItemValidationRules = {
  name: (value) => {
    if (!value || value.trim().length < 2) {
      return 'Menu item name must be at least 2 characters long';
    }
    if (value.length > 100) {
      return 'Menu item name cannot exceed 100 characters';
    }
    return null;
  },
  description: (value) => {
    if (value && value.length > 300) {
      return 'Description cannot exceed 300 characters';
    }
    return null;
  },
  price: (value) => {
    if (value === undefined || value === null || value === '') {
      return 'Price is required';
    }
    const price = parseFloat(value);
    if (isNaN(price) || price <= 0) {
      return 'Price must be a positive number';
    }
    if (price > 10000) {
      return 'Price cannot exceed $10,000';
    }
    // More lenient decimal check - allow up to 2 decimal places
    const rounded = Math.round(price * 100) / 100;
    if (Math.abs(price - rounded) > 0.001) {
      return 'Price must have at most 2 decimal places';
    }
    return null;
  },
  category: (value) => {
    const validCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'];
    if (!value) {
      return 'Category is required';
    }
    if (!validCategories.includes(value)) {
      return `Category must be one of: ${validCategories.join(', ')}`;
    }
    return null;
  },
  preparationTime: (value) => {
    if (value !== undefined) {
      const time = parseInt(value);
      if (isNaN(time) || time < 1 || time > 120) {
        return 'Preparation time must be between 1 and 120 minutes';
      }
    }
    return null;
  },
  allergens: (value) => {
    if (value && Array.isArray(value)) {
      const validAllergens = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Sesame'];
      const invalidAllergens = value.filter(allergen => !validAllergens.includes(allergen));
      if (invalidAllergens.length > 0) {
        return `Invalid allergens: ${invalidAllergens.join(', ')}. Valid options: ${validAllergens.join(', ')}`;
      }
    }
    return null;
  },
  spiceLevel: (value) => {
    if (value) {
      const validLevels = ['Mild', 'Medium', 'Hot', 'Extra Hot', 'Not Applicable'];
      if (!validLevels.includes(value)) {
        return `Spice level must be one of: ${validLevels.join(', ')}`;
      }
    }
    return null;
  },
  isVegetarian: (value) => {
    // Optional boolean field - no validation needed if not provided
    return null;
  },
  isVegan: (value) => {
    // Optional boolean field - no validation needed if not provided
    return null;
  },
  isAvailable: (value) => {
    // Optional boolean field - no validation needed if not provided
    return null;
  },
  image: (value) => {
    // Optional string field - no validation needed if not provided
    return null;
  },
  ingredients: (value) => {
    // Optional array field - no validation needed if not provided
    return null;
  },
  nutritionalInfo: (value) => {
    // Optional object field - no validation needed if not provided
    return null;
  }
};

// Middleware to check menu item ownership
const checkMenuItemOwnership = async (req, res, next) => {
  try {
    // Validate ID format before querying database
    const itemId = req.params.id;
    if (!itemId || typeof itemId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    const menuItem = await MenuItem.findById(itemId).populate('restaurantId');
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if the authenticated user owns the restaurant that owns this menu item
    if (menuItem.restaurantId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage menu items for your own restaurant'
      });
    }

    // Attach menu item to request for use in route handler
    req.menuItem = menuItem;
    next();
  } catch (error) {
    console.error('Menu item ownership check error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error checking menu item ownership',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Middleware to verify restaurant ownership for menu creation
const verifyRestaurantOwnership = async (req, res, next) => {
  try {
    console.log('🔍 Verifying restaurant ownership for user:', req.user._id);
    
    // Find restaurant by owner ID (authenticated user) instead of requiring restaurantId in body
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    
    if (!restaurant) {
      console.log('❌ Restaurant profile not found for owner:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found. Please create your restaurant profile first.',
        code: 'RESTAURANT_NOT_FOUND'
      });
    }

    console.log('✅ Restaurant found:', restaurant._id, restaurant.name);

    if (!restaurant.isActive) {
      console.log('⚠️  Restaurant is inactive:', restaurant._id);
      return res.status(400).json({
        success: false,
        message: 'Cannot add menu items to inactive restaurant',
        code: 'RESTAURANT_INACTIVE'
      });
    }

    // Attach restaurant to request
    req.restaurant = restaurant;
    
    // Add restaurantId to request body for menu item creation
    req.body.restaurantId = restaurant._id;
    
    console.log('✅ Restaurant ownership verified, proceeding...');
    
    next();
  } catch (error) {
    console.error('Restaurant ownership verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error verifying restaurant ownership',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Get menu items for authenticated restaurant owner
// @route   GET /api/menu
// @access  Private (Restaurant owners only)
router.get('/',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      console.log('🍽️ GET /api/menu - User ID:', req.user._id);
      
      // Find restaurant by owner ID
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      
      if (!restaurant) {
        console.log('❌ Restaurant not found for owner:', req.user._id);
        return res.status(404).json({
          success: false,
          message: 'Restaurant profile not found. Please create your restaurant profile first.'
        });
      }
      
      console.log('✅ Restaurant found:', restaurant._id, restaurant.name);

      const {
        page = 1,
        limit = 20,
        category,
        available,
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Build query
      const query = { restaurantId: restaurant._id };

      // Filter by availability
      if (available === 'true') {
        query.isAvailable = true;
      } else if (available === 'false') {
        query.isAvailable = false;
      }

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { ingredients: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      console.log('🔍 Querying menu items with:', query);
      
      const menuItems = await MenuItem.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      console.log(`📊 Found ${menuItems.length} menu items`);

      // Get total count for pagination
      const total = await MenuItem.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Get category statistics
      const categoryStats = await MenuItem.aggregate([
        { $match: { restaurantId: restaurant._id } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            available: { $sum: { $cond: ['$isAvailable', 1, 0] } }
          }
        }
      ]);

      res.json({
        success: true,
        message: 'Menu items retrieved successfully',
        data: {
          items: menuItems,
          total: total
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        stats: {
          totalItems: total,
          categories: categoryStats,
          restaurant: {
            id: restaurant._id,
            name: restaurant.name
          }
        }
      });

    } catch (error) {
      console.error('Get menu items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve menu items',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get all menu items for a restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const {
      category,
      available = 'true',
      sortBy = 'category',
      sortOrder = 'asc',
      minPrice,
      maxPrice,
      vegetarian,
      vegan,
      spiceLevel,
      search
    } = req.query;

    // Verify restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
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

    // Build query
    const query = { restaurantId };

    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
    } else if (available === 'false') {
      query.isAvailable = false;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by dietary preferences
    if (vegetarian === 'true') {
      query.isVegetarian = true;
    }
    if (vegan === 'true') {
      query.isVegan = true;
    }

    // Filter by spice level
    if (spiceLevel) {
      query.spiceLevel = spiceLevel;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const menuItems = await MenuItem.find(query).sort(sort);

    // Group by category
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Calculate statistics
    const stats = {
      totalItems: menuItems.length,
      categoriesCount: Object.keys(menuByCategory).length,
      averagePrice: menuItems.length > 0 
        ? Math.round((menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length) * 100) / 100
        : 0,
      priceRange: menuItems.length > 0 
        ? {
            min: Math.min(...menuItems.map(item => item.price)),
            max: Math.max(...menuItems.map(item => item.price))
          }
        : { min: 0, max: 0 },
      vegetarianCount: menuItems.filter(item => item.isVegetarian).length,
      veganCount: menuItems.filter(item => item.isVegan).length
    };

    res.json({
      success: true,
      message: 'Menu items retrieved successfully',
      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          isActive: restaurant.isActive
        },
        menuItems: menuByCategory,
        stats
      }
    });

  } catch (error) {
    console.error('Get menu items error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Add new menu item
// @route   POST /api/menu
// @access  Private (Restaurant owners only)
router.post('/',
  protect,
  authorize('restaurant'),
  verifyRestaurantOwnership,
  // Temporarily remove strict validation to debug
  // createValidator(menuItemValidationRules),
  async (req, res) => {
    try {
      console.log('🍽️ POST /api/menu - Creating menu item');
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('🏪 Restaurant from middleware:', req.restaurant?._id, req.restaurant?.name);
      
      const {
        restaurantId,
        name,
        description,
        price,
        category,
        image,
        preparationTime,
        ingredients,
        allergens,
        isVegetarian,
        isVegan,
        spiceLevel,
        nutritionalInfo
      } = req.body;
      
      // Log individual field values for debugging
      console.log('🔍 Field values:');
      console.log('  name:', name, typeof name);
      console.log('  description:', description, typeof description);
      console.log('  price:', price, typeof price);
      console.log('  category:', category, typeof category);
      console.log('  restaurantId:', restaurantId, typeof restaurantId);

      // Manual validation with detailed logging
      const validationErrors = [];
      
      // Validate name
      if (!name || name.trim().length < 2) {
        validationErrors.push({ field: 'name', message: 'Name must be at least 2 characters' });
      }
      
      // Validate description
      if (!description || description.trim().length < 1) {
        validationErrors.push({ field: 'description', message: 'Description is required' });
      }
      
      // Validate price
      const priceNum = parseFloat(price);
      if (!price || isNaN(priceNum) || priceNum <= 0) {
        validationErrors.push({ field: 'price', message: 'Valid price is required' });
      }
      
      // Validate category
      const validCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'];
      if (!category || !validCategories.includes(category)) {
        validationErrors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
      }
      
      console.log('🔍 Validation errors:', validationErrors);
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Check if menu item with same name already exists in this restaurant
      const existingItem = await MenuItem.findOne({
        restaurantId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });

      if (existingItem) {
        console.log('❌ Item with same name exists:', existingItem.name);
        return res.status(409).json({
          success: false,
          message: 'Menu item with this name already exists in your restaurant',
          field: 'name'
        });
      }

      // Create menu item
      const menuItemData = {
        restaurantId,
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(price),
        category,
        image: image || '',
        preparationTime: preparationTime ? parseInt(preparationTime) : 15,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        allergens: Array.isArray(allergens) ? allergens : [],
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        spiceLevel: spiceLevel || 'Not Applicable',
        isAvailable: true
      };

      // Add nutritional info if provided
      if (nutritionalInfo) {
        menuItemData.nutritionalInfo = {
          calories: nutritionalInfo.calories || 0,
          protein: nutritionalInfo.protein || 0,
          carbs: nutritionalInfo.carbs || 0,
          fat: nutritionalInfo.fat || 0
        };
      }

      console.log('💾 Creating menu item with data:', JSON.stringify(menuItemData, null, 2));

      const menuItem = await MenuItem.create(menuItemData);
      
      console.log('✅ Menu item created successfully:', menuItem._id, menuItem.name);

      // Populate restaurant information
      await menuItem.populate('restaurantId', 'name ownerId');

      console.log(`✅ Menu item created: ${name} for ${req.restaurant.name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: menuItem
      });

    } catch (error) {
      console.error('Create menu item error:', error);

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
        message: 'Failed to create menu item',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Owner only)
router.put('/:id',
  protect,
  authorize('restaurant'),
  checkMenuItemOwnership,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        image,
        preparationTime,
        ingredients,
        allergens,
        isVegetarian,
        isVegan,
        spiceLevel,
        nutritionalInfo
      } = req.body;

      const menuItem = req.menuItem;

      // Validate fields if provided
      const errors = [];
      
      if (name !== undefined) {
        const nameError = menuItemValidationRules.name(name);
        if (nameError) errors.push({ field: 'name', message: nameError });
        
        // Check if new name conflicts with existing items (excluding current item)
        if (name !== menuItem.name) {
          const nameExists = await MenuItem.findOne({
            restaurantId: menuItem.restaurantId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: menuItem._id }
          });
          if (nameExists) {
            errors.push({ field: 'name', message: 'Menu item with this name already exists' });
          }
        }
      }

      if (description !== undefined) {
        const descError = menuItemValidationRules.description(description);
        if (descError) errors.push({ field: 'description', message: descError });
      }

      if (price !== undefined) {
        const priceError = menuItemValidationRules.price(price);
        if (priceError) errors.push({ field: 'price', message: priceError });
      }

      if (category !== undefined) {
        const categoryError = menuItemValidationRules.category(category);
        if (categoryError) errors.push({ field: 'category', message: categoryError });
      }

      if (preparationTime !== undefined) {
        const timeError = menuItemValidationRules.preparationTime(preparationTime);
        if (timeError) errors.push({ field: 'preparationTime', message: timeError });
      }

      if (allergens !== undefined) {
        const allergensError = menuItemValidationRules.allergens(allergens);
        if (allergensError) errors.push({ field: 'allergens', message: allergensError });
      }

      if (spiceLevel !== undefined) {
        const spiceError = menuItemValidationRules.spiceLevel(spiceLevel);
        if (spiceError) errors.push({ field: 'spiceLevel', message: spiceError });
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
      if (price !== undefined) updateData.price = parseFloat(price);
      if (category !== undefined) updateData.category = category;
      if (image !== undefined) updateData.image = image;
      if (preparationTime !== undefined) updateData.preparationTime = parseInt(preparationTime);
      if (ingredients !== undefined) updateData.ingredients = Array.isArray(ingredients) ? ingredients : [];
      if (allergens !== undefined) updateData.allergens = Array.isArray(allergens) ? allergens : [];
      if (isVegetarian !== undefined) updateData.isVegetarian = Boolean(isVegetarian);
      if (isVegan !== undefined) updateData.isVegan = Boolean(isVegan);
      if (spiceLevel !== undefined) updateData.spiceLevel = spiceLevel;

      // Handle nutritional info
      if (nutritionalInfo !== undefined) {
        updateData.nutritionalInfo = {
          calories: nutritionalInfo.calories || 0,
          protein: nutritionalInfo.protein || 0,
          carbs: nutritionalInfo.carbs || 0,
          fat: nutritionalInfo.fat || 0
        };
      }

      // Ensure vegan items are also vegetarian
      if (updateData.isVegan && !updateData.isVegetarian) {
        updateData.isVegetarian = true;
      }

      // Update menu item
      const updatedMenuItem = await MenuItem.findByIdAndUpdate(
        menuItem._id,
        updateData,
        { new: true, runValidators: true }
      ).populate('restaurantId', 'name ownerId');

      console.log(`✅ Menu item updated: ${updatedMenuItem.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: updatedMenuItem
      });

    } catch (error) {
      console.error('Update menu item error:', error);

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
        message: 'Failed to update menu item',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Remove menu item
// @route   DELETE /api/menu/:id
// @access  Private (Owner only)
router.delete('/:id',
  protect,
  authorize('restaurant'),
  checkMenuItemOwnership,
  async (req, res) => {
    try {
      const menuItem = req.menuItem;

      // Remove the menu item
      await MenuItem.findByIdAndDelete(menuItem._id);

      console.log(`✅ Menu item deleted: ${menuItem.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Menu item deleted successfully',
        data: {
          _id: menuItem._id,
          name: menuItem.name,
          restaurantId: menuItem.restaurantId
        }
      });

    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu item',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Toggle menu item availability
// @route   PUT /api/menu/:id/toggle
// @access  Private (Owner only)
router.put('/:id/toggle',
  protect,
  authorize('restaurant'),
  checkMenuItemOwnership,
  async (req, res) => {
    try {
      const menuItem = req.menuItem;

      // Toggle availability
      menuItem.isAvailable = !menuItem.isAvailable;
      await menuItem.save();

      console.log(`✅ Menu item availability toggled: ${menuItem.name} (${menuItem.isAvailable ? 'Available' : 'Unavailable'}) by ${req.user.email}`);

      res.json({
        success: true,
        message: `Menu item ${menuItem.isAvailable ? 'made available' : 'made unavailable'}`,
        data: {
          _id: menuItem._id,
          name: menuItem.name,
          isAvailable: menuItem.isAvailable,
          restaurantId: menuItem.restaurantId
        }
      });

    } catch (error) {
      console.error('Toggle menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle menu item availability',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get menu item details
// @route   GET /api/menu/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurantId', 'name address phone rating isActive');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if restaurant is active
    if (!menuItem.restaurantId.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Menu item is from an inactive restaurant'
      });
    }

    res.json({
      success: true,
      message: 'Menu item details retrieved successfully',
      data: menuItem
    });

  } catch (error) {
    console.error('Get menu item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu item details',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Bulk update menu items availability
// @route   PUT /api/menu/bulk/toggle
// @access  Private (Owner only)
router.put('/bulk/toggle',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      const { menuItemIds, isAvailable } = req.body;

      if (!Array.isArray(menuItemIds) || menuItemIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Menu item IDs array is required'
        });
      }

      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isAvailable must be a boolean value'
        });
      }

      // Get user's restaurant
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Update menu items that belong to the user's restaurant
      const result = await MenuItem.updateMany(
        {
          _id: { $in: menuItemIds },
          restaurantId: restaurant._id
        },
        { isAvailable }
      );

      console.log(`✅ Bulk menu items availability updated: ${result.modifiedCount} items by ${req.user.email}`);

      res.json({
        success: true,
        message: `${result.modifiedCount} menu items updated successfully`,
        data: {
          modifiedCount: result.modifiedCount,
          isAvailable
        }
      });

    } catch (error) {
      console.error('Bulk toggle menu items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu items',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

module.exports = router;