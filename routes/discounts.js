const express = require('express');
const { Restaurant } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { formatDiscountForDisplay, getFormattedActiveDiscounts, isDiscountActive } = require('../utils/discountCalculator');

const router = express.Router();

// Middleware to check restaurant ownership
const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId;
    
    if (!restaurantId || !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
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
        message: 'Access denied. You can only manage discounts for your own restaurant'
      });
    }

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

/**
 * @route   GET /api/discounts/:restaurantId
 * @desc    Get all discounts for a restaurant (public - shows only active, visible discounts)
 * @access  Public
 */
router.get('/:restaurantId', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    
    if (!restaurantId || !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
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

    const activeDiscounts = getFormattedActiveDiscounts(restaurant.studentDiscounts);

    res.status(200).json({
      success: true,
      data: {
        restaurantId,
        restaurantName: restaurant.name,
        discountCount: activeDiscounts.length,
        discounts: activeDiscounts
      }
    });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discounts',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @route   GET /api/discounts/:restaurantId/owner
 * @desc    Get all discounts for a restaurant (owner view - shows all)
 * @access  Private (Restaurant Owner)
 */
router.get('/:restaurantId/owner', protect, authorize('restaurant'), checkRestaurantOwnership, async (req, res) => {
  try {
    const discounts = req.restaurant.studentDiscounts.map(discount => ({
      ...discount.toObject(),
      status: require('../utils/discountCalculator').getDiscountStatus(discount)
    }));

    res.status(200).json({
      success: true,
      data: {
        restaurantId: req.restaurant._id,
        restaurantName: req.restaurant.name,
        totalDiscounts: discounts.length,
        activeCount: discounts.filter(d => d.status.isActive).length,
        discounts
      }
    });
  } catch (error) {
    console.error('Error fetching discounts for owner:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discounts',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/discounts/:restaurantId
 * @desc    Create a new discount (owner only)
 * @access  Private (Restaurant Owner)
 */
router.post('/:restaurantId', protect, authorize('restaurant'), checkRestaurantOwnership, async (req, res) => {
  try {
    const { type, value, bogo, applicableItems, applicableCategories, description, startDate, endDate, isActive, isVisible } = req.body;

    // Validation
    if (!type || !['percentage', 'bogo'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "bogo"'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (type === 'percentage') {
      if (!value || value <= 0 || value > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage must be between 1 and 100'
        });
      }
    } else if (type === 'bogo') {
      if (!bogo || !bogo.buy || !bogo.free || bogo.buy <= 0 || bogo.free <= 0) {
        return res.status(400).json({
          success: false,
          message: 'BOGO discount requires buy and free quantities (both > 0)'
        });
      }
    }

    await req.restaurant.addDiscount({
      type,
      value: type === 'percentage' ? value : undefined,
      bogo: type === 'bogo' ? bogo : undefined,
      applicableItems,
      applicableCategories,
      description,
      startDate,
      endDate,
      isActive: isActive !== false,
      isVisible: isVisible !== false
    });

    const newDiscount = req.restaurant.studentDiscounts[req.restaurant.studentDiscounts.length - 1];

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data: {
        discountId: newDiscount._id,
        discount: formatDiscountForDisplay(newDiscount)
      }
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating discount',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @route   PUT /api/discounts/:restaurantId/:discountId
 * @desc    Update a discount (owner only)
 * @access  Private (Restaurant Owner)
 */
router.put('/:restaurantId/:discountId', protect, authorize('restaurant'), checkRestaurantOwnership, async (req, res) => {
  try {
    const { discountId } = req.params;
    const updateData = req.body;

    if (!discountId || !/^[0-9a-fA-F]{24}$/.test(discountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount ID format'
      });
    }

    // Validate update data
    if (updateData.type && !['percentage', 'bogo'].includes(updateData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "bogo"'
      });
    }

    if (updateData.value !== undefined && (updateData.value <= 0 || updateData.value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage must be between 1 and 100'
      });
    }

    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : new Date(req.restaurant.studentDiscounts.id(discountId).startDate);
      const endDate = updateData.endDate ? new Date(updateData.endDate) : new Date(req.restaurant.studentDiscounts.id(discountId).endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    await req.restaurant.updateDiscount(discountId, updateData);

    const updatedDiscount = req.restaurant.studentDiscounts.id(discountId);

    res.status(200).json({
      success: true,
      message: 'Discount updated successfully',
      data: {
        discountId: updatedDiscount._id,
        discount: formatDiscountForDisplay(updatedDiscount)
      }
    });
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating discount',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @route   DELETE /api/discounts/:restaurantId/:discountId
 * @desc    Delete a discount (owner only)
 * @access  Private (Restaurant Owner)
 */
router.delete('/:restaurantId/:discountId', protect, authorize('restaurant'), checkRestaurantOwnership, async (req, res) => {
  try {
    const { discountId } = req.params;

    if (!discountId || !/^[0-9a-fA-F]{24}$/.test(discountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount ID format'
      });
    }

    const discount = req.restaurant.studentDiscounts.id(discountId);
    
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    await req.restaurant.deleteDiscount(discountId);

    res.status(200).json({
      success: true,
      message: 'Discount deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting discount',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

/**
 * @route   GET /api/discounts/:restaurantId/:discountId
 * @desc    Get a specific discount details
 * @access  Public
 */
router.get('/:restaurantId/:discountId', async (req, res) => {
  try {
    const { restaurantId, discountId } = req.params;

    if (!restaurantId || !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    if (!discountId || !/^[0-9a-fA-F]{24}$/.test(discountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount ID format'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const discount = restaurant.studentDiscounts.id(discountId);
    
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    // Only show if active and visible (or if owner is requesting)
    const isOwner = req.user && restaurant.ownerId.toString() === req.user._id.toString();
    if (!isOwner && (!discount.isActive || !discount.isVisible)) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        discount: formatDiscountForDisplay(discount)
      }
    });
  } catch (error) {
    console.error('Error fetching discount details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discount details',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;