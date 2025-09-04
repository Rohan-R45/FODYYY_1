const express = require('express');
const { Order, User, Restaurant, MenuItem } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { createValidator } = require('../middleware/validation');

const router = express.Router();

// Valid order status transitions
const statusTransitions = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['preparing', 'cancelled'],
  'preparing': ['ready', 'cancelled'],
  'ready': ['out_for_delivery'],
  'out_for_delivery': ['delivered'],
  'delivered': [], // Final state
  'cancelled': [] // Final state
};

// Valid payment statuses
const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

// Validation rules for order creation
const orderValidationRules = {
  restaurantId: (value) => {
    if (!value) {
      return 'Restaurant ID is required';
    }
    return null;
  },
  items: (value) => {
    if (!Array.isArray(value) || value.length === 0) {
      return 'At least one item is required';
    }
    
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (!item.menuItemId) {
        return `Item ${i + 1}: Menu item ID is required`;
      }
      if (!item.quantity || item.quantity < 1 || item.quantity > 10) {
        return `Item ${i + 1}: Quantity must be between 1 and 10`;
      }
      if (item.specialInstructions && item.specialInstructions.length > 200) {
        return `Item ${i + 1}: Special instructions cannot exceed 200 characters`;
      }
    }
    return null;
  },
  deliveryAddress: (value) => {
    if (!value || value.trim().length < 10) {
      return 'Delivery address must be at least 10 characters long';
    }
    if (value.length > 300) {
      return 'Delivery address cannot exceed 300 characters';
    }
    return null;
  },
  phoneNumber: (value) => {
    if (!value) {
      return 'Phone number is required';
    }
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return 'Phone number must be between 10-15 digits';
    }
    return null;
  },
  paymentMethod: (value) => {
    const validMethods = ['upi', 'cash_on_delivery', 'cod'];
    if (!value || !validMethods.includes(value)) {
      return `Payment method must be one of: ${validMethods.join(', ')}`;
    }
    return null;
  }
};

// Middleware to check order ownership for students
const checkStudentOrderOwnership = async (req, res, next) => {
  try {
    // Validate ID format before querying database
    const orderId = req.params.id;
    if (!orderId || typeof orderId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(orderId)
      .populate('studentId', 'name email phone')
      .populate('restaurantId', 'name address phone ownerId')
      .populate('items.menuItemId', 'name price category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the authenticated user is the student who placed the order
    if (order.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders'
      });
    }

    req.order = order;
    next();
  } catch (error) {
    console.error('Student order ownership check error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error checking order ownership',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Middleware to check order ownership for restaurant owners
const checkRestaurantOrderOwnership = async (req, res, next) => {
  try {
    // Validate ID format before querying database
    const orderId = req.params.id;
    if (!orderId || typeof orderId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(orderId)
      .populate('studentId', 'name email phone')
      .populate('restaurantId', 'name address phone ownerId')
      .populate('items.menuItemId', 'name price category');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the authenticated user owns the restaurant for this order
    if (order.restaurantId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage orders for your own restaurant'
      });
    }

    req.order = order;
    next();
  } catch (error) {
    console.error('Restaurant order ownership check error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error checking order ownership',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Middleware for flexible order access (student or restaurant owner)
const checkOrderAccess = async (req, res, next) => {
  try {
    // Validate ID format before querying database
    const orderId = req.params.id;
    if (!orderId || typeof orderId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(orderId)
      .populate('studentId', 'name email phone')
      .populate('restaurantId', 'name address phone ownerId')
      .populate('items.menuItemId', 'name price category image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is either the student who placed the order or the restaurant owner
    const isStudent = req.user.role === 'student' && order.studentId._id.toString() === req.user._id.toString();
    const isRestaurantOwner = req.user.role === 'restaurant' && order.restaurantId.ownerId.toString() === req.user._id.toString();

    if (!isStudent && !isRestaurantOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view orders you are authorized to see'
      });
    }

    req.order = order;
    req.userRole = isStudent ? 'student' : 'restaurant';
    next();
  } catch (error) {
    console.error('Order access check error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error checking order access',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Helper function to calculate order total
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Helper function to format order response
const formatOrderResponse = (order, userRole = null) => {
  const subtotal = calculateOrderTotal(order.items);
  const deliveryFee = order.deliveryFee || 0;
  const tax = order.tax || 0;
  const discount = (order.discount && typeof order.discount.amount === 'number') ? order.discount.amount : (order.discount || 0);
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  const formattedOrder = {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    // Sum of items (at order time). Some clients treat this as items subtotal.
    totalAmount: order.totalAmount,
    // Provide explicit monetary breakdown so clients don't guess
    subtotal,
    deliveryFee,
    tax,
    // Keep both number and detail object compatibility
    discount,
    discountDetails: order.discount || { amount: 0 },
    // Explicit payable total for UI clients (final amount payable)
    total,

    deliveryAddress: order.deliveryAddress,
    phoneNumber: order.phoneNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    specialInstructions: order.specialInstructions,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map(item => {
      const menu = item && item.menuItemId && typeof item.menuItemId === 'object' ? item.menuItemId : {};
      const unitPrice = Number(item.price);
      const quantity = Number(item.quantity);
      const totalPrice = unitPrice * quantity;
      return {
        _id: item._id,
        // Include stable name at top-level (fallback to populated data if available)
        name: item.name || menu.name,
        menuItem: {
          _id: menu._id || item.menuItemId || null,
          name: menu.name || item.name,
          price: (menu.price !== undefined ? menu.price : unitPrice),
          category: menu.category || null,
          image: menu.image || null
        },
        quantity,
        // Explicit fields required by UI/requirements
        unitPrice,
        totalPrice,
        // Backward compatibility with existing UI fields
        price: unitPrice, // price locked at order time
        subtotal: totalPrice,
        specialInstructions: item.specialInstructions
      };
    }),
    restaurant: {
      _id: order.restaurantId._id,
      name: order.restaurantId.name,
      address: order.restaurantId.address,
      phone: order.restaurantId.phone
    }
  };

  // Include student info for restaurant owners, exclude for students (privacy)
  if (userRole === 'restaurant') {
    formattedOrder.student = {
      _id: order.studentId._id,
      name: order.studentId.name,
      email: order.studentId.email,
      phone: order.studentId.phone
    };
  }

  return formattedOrder;
};

// @desc    Get order tracking details
// @route   GET /api/orders/:id/tracking
// @access  Private (Student who placed order or Restaurant owner)
router.get('/:id/tracking',
  protect,
  checkOrderAccess,
  async (req, res) => {
    try {
      const order = req.order;
      
      // Calculate time remaining for delivery
      const now = new Date();
      const estimatedTime = new Date(order.estimatedDeliveryTime);
      const timeRemaining = estimatedTime > now ? Math.ceil((estimatedTime - now) / (1000 * 60)) : 0;
      
      // Status timeline with timestamps
      const statusTimeline = [
        {
          status: 'pending',
          label: 'Order Placed',
          completed: true,
          timestamp: order.createdAt,
          icon: '📝'
        },
        {
          status: 'confirmed',
          label: 'Order Confirmed',
          completed: ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status),
          timestamp: order.status === 'confirmed' ? order.updatedAt : null,
          icon: '✅'
        },
        {
          status: 'preparing',
          label: 'Preparing Food',
          completed: ['preparing', 'ready', 'delivered'].includes(order.status),
          timestamp: order.status === 'preparing' ? order.updatedAt : null,
          icon: '👨‍🍳'
        },
        {
          status: 'ready',
          label: 'Ready for Pickup',
          completed: ['ready', 'delivered'].includes(order.status),
          timestamp: order.status === 'ready' ? order.updatedAt : null,
          icon: '🎒'
        },
        {
          status: 'delivered',
          label: 'Delivered',
          completed: order.status === 'delivered',
          timestamp: order.actualDeliveryTime,
          icon: '🎉'
        }
      ];

      const trackingData = {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          phone: order.phone,
          specialInstructions: order.specialInstructions,
          createdAt: order.createdAt,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          actualDeliveryTime: order.actualDeliveryTime,
          timeRemaining: timeRemaining,
          canCancel: order.canCancel,
          canRate: order.canRate
        },
        restaurant: {
          _id: order.restaurantId._id,
          name: order.restaurantId.name,
          address: order.restaurantId.address,
          phone: order.restaurantId.phone
        },
        items: order.items.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions,
          menuItem: {
            _id: item.menuItemId._id,
            name: item.menuItemId.name,
            category: item.menuItemId.category,
            image: item.menuItemId.image
          }
        })),
        statusTimeline,
        currentStep: statusTimeline.findIndex(step => step.status === order.status),
        paymentInstructions: order.paymentMethod === 'UPI' && order.paymentStatus === 'pending' ? {
          upiId: 'restaurant@upi', // This should come from restaurant settings
          amount: order.totalAmount,
          note: `Payment for Order ${order.orderNumber}`
        } : null
      };

      // Add student info for restaurant owners
      if (req.userRole === 'restaurant') {
        trackingData.student = {
          _id: order.studentId._id,
          name: order.studentId.name,
          email: order.studentId.email,
          phone: order.studentId.phone
        };
      }

      res.json({
        success: true,
        message: 'Order tracking details retrieved successfully',
        data: trackingData
      });

    } catch (error) {
      console.error('Get order tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving order tracking details',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Update order status (Restaurant owners only)
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant owner only)
router.put('/:id/status',
  protect,
  authorize('restaurant'),
  checkRestaurantOrderOwnership,
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = req.order;

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Check if status transition is valid
      const currentStatus = order.status;
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['delivered'],
        'delivered': [],
        'cancelled': []
      };

      if (!validTransitions[currentStatus].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${currentStatus} to ${status}`
        });
      }

      // Update order status
      order.status = status;
      
      if (status === 'delivered') {
        order.actualDeliveryTime = new Date();
      }
      
      if (status === 'cancelled') {
        order.cancelledAt = new Date();
        order.cancelledBy = 'restaurant';
      }

      await order.save();

      // Return updated tracking data
      const now = new Date();
      const estimatedTime = new Date(order.estimatedDeliveryTime);
      const timeRemaining = estimatedTime > now ? Math.ceil((estimatedTime - now) / (1000 * 60)) : 0;

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          updatedAt: order.updatedAt,
          timeRemaining,
          actualDeliveryTime: order.actualDeliveryTime
        }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order status',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get restaurant orders for management
// @route   GET /api/orders/restaurant/manage
// @access  Private (Restaurant owners only)
router.get('/restaurant/manage',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      // Find restaurant owned by current user
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Build query
      const query = { restaurantId: restaurant._id };
      if (status && status !== 'all') {
        query.status = status;
      }

      // Get orders with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const orders = await Order.find(query)
        .populate('studentId', 'name email phone')
        .populate('items.menuItemId', 'name price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / parseInt(limit));

      // Format orders for management view (include computed final total)
      const formattedOrders = orders.map(order => {
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = Number(order.deliveryFee || 0);
        const tax = Number(order.tax || 0);
        const discount = (order.discount && typeof order.discount.amount === 'number') ? order.discount.amount : Number(order.discount || 0);
        const total = Math.max(0, subtotal + deliveryFee + tax - discount);

        // Build detailed items preserving original order and using locked-in snapshot values
        const items = order.items.map(item => {
          const menu = item && item.menuItemId && typeof item.menuItemId === 'object' ? item.menuItemId : {};
          const unitPrice = Number(item.price);
          const quantity = Number(item.quantity);
          return {
            _id: item._id,
            name: item.name || menu.name, // name captured at order time
            quantity,
            unitPrice,
            price: unitPrice, // compatibility with existing UI
            totalPrice: unitPrice * quantity,
            // Optional minimal menu info for UI (icon/image)
            menuItem: {
              _id: menu._id || item.menuItemId || null,
              image: menu.image || null
            }
          };
        });

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          // Keep original field for compatibility
          totalAmount: order.totalAmount,
          // Provide explicit amounts for UI correctness
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
          createdAt: order.createdAt,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          student: {
            _id: order.studentId._id,
            name: order.studentId.name,
            phone: order.studentId.phone
          },
          items, // include detailed items for frontend rendering
          itemsCount: order.items.length,
          totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
          canUpdateStatus: !['delivered', 'cancelled'].includes(order.status)
        };
      });

      res.json({
        success: true,
        message: 'Restaurant orders retrieved successfully',
        data: {
          orders: formattedOrders,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalOrders,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          },
          stats: {
            pending: await Order.countDocuments({ restaurantId: restaurant._id, status: 'pending' }),
            confirmed: await Order.countDocuments({ restaurantId: restaurant._id, status: 'confirmed' }),
            preparing: await Order.countDocuments({ restaurantId: restaurant._id, status: 'preparing' }),
            ready: await Order.countDocuments({ restaurantId: restaurant._id, status: 'ready' }),
            delivered: await Order.countDocuments({ restaurantId: restaurant._id, status: 'delivered' })
          }
        }
      });

    } catch (error) {
      console.error('Get restaurant orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving restaurant orders',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Place new order
// @route   POST /api/orders
// @access  Private (Students only)
router.post('/',
  protect,
  authorize('student'),
  createValidator(orderValidationRules),
  async (req, res) => {
    try {
      console.log('\n📨 Order Request Received:');
      console.log('User:', req.user?.email);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const {
        restaurantId,
        items,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        specialInstructions
      } = req.body;

      // Verify restaurant exists and is active
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      if (!restaurant.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant is currently inactive and not accepting orders'
        });
      }

      // Verify all menu items exist, are available, and belong to the restaurant
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItems = await MenuItem.find({
        _id: { $in: menuItemIds },
        restaurantId: restaurantId
      });

      if (menuItems.length !== menuItemIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more menu items not found or do not belong to this restaurant'
        });
      }

      // Check if all items are available
      const unavailableItems = menuItems.filter(item => !item.isAvailable);
      if (unavailableItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some menu items are currently unavailable',
          unavailableItems: unavailableItems.map(item => ({
            id: item._id,
            name: item.name
          }))
        });
      }

      // Build order items with current prices
      const orderItems = items.map(orderItem => {
        const menuItem = menuItems.find(mi => mi._id.toString() === orderItem.menuItemId);
        return {
          menuItemId: menuItem._id,
          name: menuItem.name, // Add the required name field
          quantity: orderItem.quantity,
          price: menuItem.price, // Use current price from menu
          specialInstructions: orderItem.specialInstructions || ''
        };
      });

      // Calculate subtotal (sum of item prices at order time)
      const subtotal = calculateOrderTotal(orderItems);

      // Determine delivery fee using restaurant settings when available, else use defaults
      // Defaults: charge = 30, freeAbove = 300 (matches frontend fallback)
      const ds = (restaurant && restaurant.deliverySettings) ? restaurant.deliverySettings : {};
      const deliveryCharge = typeof ds.deliveryCharge === 'number' ? ds.deliveryCharge : 30;
      const freeAbove = typeof ds.freeDeliveryAbove === 'number' ? ds.freeDeliveryAbove : 300;
      const deliveryFee = subtotal > 0 && subtotal >= freeAbove ? 0 : (subtotal > 0 ? deliveryCharge : 0);

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Calculate estimated delivery time (restaurant's delivery time + 10 minutes buffer)
      const deliveryTimeMatch = restaurant.deliveryTime.match(/(\d+)-(\d+)/);
      const maxDeliveryTime = deliveryTimeMatch ? parseInt(deliveryTimeMatch[1]) + 10 : 45;
      const estimatedDeliveryTime = new Date(Date.now() + maxDeliveryTime * 60 * 1000);

      // Create order
      const orderData = {
        orderNumber,
        studentId: req.user._id,
        restaurantId,
        items: orderItems,
        totalAmount: Math.round(subtotal * 100) / 100, // Store items sum as subtotal-compatible field
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        deliveryAddress,
        phone: phoneNumber,
        paymentMethod,
        paymentStatus: ['upi', 'UPI', 'card', 'Card'].includes(paymentMethod) ? 'pending' : 'pending',
        specialInstructions: specialInstructions || '',
        status: 'pending',
        estimatedDeliveryTime
      };

      const order = await Order.create(orderData);

      // Populate the created order
      await order.populate([
        { path: 'studentId', select: 'name email phone' },
        { path: 'restaurantId', select: 'name address phone ownerId' },
        { path: 'items.menuItemId', select: 'name price category image' }
      ]);

      console.log(`✅ Order placed: ${orderNumber} by ${req.user.email} at ${restaurant.name}`);

      // Ensure response includes explicit monetary breakdown and final total
      const formatted = formatOrderResponse(order, 'student');
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: formatted
      });

    } catch (error) {
      console.error('❌ Place order error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation errors:', error.errors);
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
        message: 'Failed to place order',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get student's order history
// @route   GET /api/orders/student
// @access  Private (Students only)
router.get('/student',
  protect,
  authorize('student'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate
      } = req.query;

      // Build query
      const query = { studentId: req.user._id };

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const orders = await Order.find(query)
        .populate('restaurantId', 'name address phone rating')
        .populate('items.menuItemId', 'name price category image')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const total = await Order.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Calculate statistics
      const stats = await Order.aggregate([
        { $match: { studentId: req.user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: {
              $sum: {
                $subtract: [
                  { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] },
                  { $ifNull: ['$discount.amount', { $ifNull: ['$discount', 0] }] }
                ]
              }
            },
            averageOrderValue: {
              $avg: {
                $subtract: [
                  { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] },
                  { $ifNull: ['$discount.amount', { $ifNull: ['$discount', 0] }] }
                ]
              }
            },
            statusCounts: {
              $push: '$status'
            }
          }
        }
      ]);

      const statusCounts = {};
      if (stats[0]) {
        stats[0].statusCounts.forEach(status => {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
      }

      const orderStats = stats[0] ? {
        totalOrders: stats[0].totalOrders,
        totalSpent: Math.round(stats[0].totalSpent * 100) / 100,
        averageOrderValue: Math.round(stats[0].averageOrderValue * 100) / 100,
        statusCounts
      } : {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        statusCounts: {}
      };

      res.json({
        success: true,
        message: 'Order history retrieved successfully',
        data: orders.map(order => formatOrderResponse(order, 'student')),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        stats: orderStats
      });

    } catch (error) {
      console.error('Get student orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order history',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get restaurant's orders
// @route   GET /api/orders/restaurant
// @access  Private (Restaurant owners only)
router.get('/restaurant',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate
      } = req.query;

      // Get restaurant owned by the user
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Build query
      const query = { restaurantId: restaurant._id };

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const orders = await Order.find(query)
        .populate('studentId', 'name email phone')
        .populate('items.menuItemId', 'name price category image')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const total = await Order.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Calculate restaurant statistics
      const stats = await Order.aggregate([
        { $match: { restaurantId: restaurant._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            statusCounts: {
              $push: '$status'
            }
          }
        }
      ]);

      const statusCounts = {};
      if (stats[0]) {
        stats[0].statusCounts.forEach(status => {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
      }

      const restaurantStats = stats[0] ? {
        totalOrders: stats[0].totalOrders,
        totalRevenue: Math.round(stats[0].totalRevenue * 100) / 100,
        averageOrderValue: Math.round(stats[0].averageOrderValue * 100) / 100,
        statusCounts
      } : {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusCounts: {}
      };

      res.json({
        success: true,
        message: 'Restaurant orders retrieved successfully',
        data: orders.map(order => formatOrderResponse(order, 'restaurant')),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        stats: restaurantStats,
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name
        }
      });

    } catch (error) {
      console.error('Get restaurant orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve restaurant orders',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant owners only)
router.put('/:id/status',
  protect,
  authorize('restaurant'),
  checkRestaurantOrderOwnership,
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = req.order;

      // Validate status
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      // Check if status transition is valid
      const allowedStatuses = statusTransitions[order.status] || [];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from '${order.status}' to '${status}'. Allowed transitions: ${allowedStatuses.join(', ') || 'none'}`
        });
      }

      // Update order status
      order.status = status;
      
      // Update estimated delivery time for certain status changes
      if (status === 'confirmed') {
        // Add 5 minutes buffer when confirmed
        order.estimatedDeliveryTime = new Date(order.estimatedDeliveryTime.getTime() + 5 * 60 * 1000);
      } else if (status === 'out_for_delivery') {
        // Set delivery time to 15 minutes from now
        order.estimatedDeliveryTime = new Date(Date.now() + 15 * 60 * 1000);
      } else if (status === 'delivered') {
        // Set actual delivery time
        order.deliveredAt = new Date();
      }

      await order.save();

      console.log(`✅ Order status updated: ${order.orderNumber} -> ${status} by ${req.user.email}`);

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          deliveredAt: order.deliveredAt
        }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Confirm UPI payment
// @route   PUT /api/orders/:id/payment
// @access  Private (Students only)
router.put('/:id/payment',
  protect,
  authorize('student'),
  checkStudentOrderOwnership,
  async (req, res) => {
    try {
      const { transactionId, paymentProof } = req.body;
      const order = req.order;

      // Validate transaction ID
      if (!transactionId || typeof transactionId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'UPI transaction ID is required'
        });
      }

      // Validate transaction ID format (basic validation)
      if (transactionId.length < 12) {
        return res.status(400).json({
          success: false,
          message: 'UPI transaction ID must be at least 12 characters long'
        });
      }

      // Only allow payment updates for UPI orders
      if (order.paymentMethod !== 'UPI') {
        return res.status(400).json({
          success: false,
          message: 'Payment confirmation is only available for UPI orders'
        });
      }

      // Only allow updates from pending status
      if (order.paymentStatus !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Payment has already been ${order.paymentStatus}`
        });
      }

      // Check for duplicate transaction ID
      const existingOrder = await Order.findOne({ 
        upiTransactionId: transactionId,
        _id: { $ne: order._id }
      });

      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: 'This transaction ID has already been used for another order'
        });
      }

      // Confirm payment using the model method
      await order.confirmPayment(transactionId, paymentProof);

      console.log(`✅ Payment confirmed: ${order.orderNumber} -> Transaction ID: ${transactionId} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          upiTransactionId: order.upiTransactionId,
          paidAt: order.paymentDetails.paidAt
        }
      });

    } catch (error) {
      console.error('Confirm payment error:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'This transaction ID has already been used'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to confirm payment',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Verify payment (Restaurant/Admin only)
// @route   PUT /api/orders/:id/payment/verify
// @access  Private (Restaurant owners only)
router.put('/:id/payment/verify',
  protect,
  authorize('restaurant'),
  checkRestaurantOrderOwnership,
  async (req, res) => {
    try {
      const { notes } = req.body;
      const order = req.order;

      // Check if payment is confirmed
      if (order.paymentStatus !== 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Payment must be confirmed by customer before verification'
        });
      }

      // Check if already verified
      if (order.paymentDetails.verifiedAt) {
        return res.status(400).json({
          success: false,
          message: 'Payment has already been verified'
        });
      }

      // Verify payment using the model method
      await order.verifyPayment(req.user._id, notes);

      console.log(`✅ Payment verified: ${order.orderNumber} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          verifiedAt: order.paymentDetails.verifiedAt,
          verifiedBy: order.paymentDetails.verifiedBy,
          notes: order.paymentDetails.notes
        }
      });

    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify payment',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get payment details for order
// @route   GET /api/orders/:id/payment
// @access  Private (Order participants only)
router.get('/:id/payment',
  protect,
  checkOrderAccess,
  async (req, res) => {
    try {
      const order = req.order;

      // Get restaurant details for UPI information
      const restaurant = await Restaurant.findById(order.restaurantId);
      
      const paymentData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        upiDetails: {
          upiId: restaurant?.upiId || order.paymentDetails.upiId || 'restaurant@upi',
          qrCode: order.paymentDetails.qrCode || null,
          amount: order.totalAmount,
          note: `Payment for Order ${order.orderNumber}`
        },
        transactionId: order.upiTransactionId,
        paidAt: order.paymentDetails.paidAt,
        verifiedAt: order.paymentDetails.verifiedAt,
        canConfirmPayment: req.userRole === 'student' && order.paymentStatus === 'pending',
        canVerifyPayment: req.userRole === 'restaurant' && order.paymentStatus === 'paid' && !order.paymentDetails.verifiedAt
      };

      res.json({
        success: true,
        message: 'Payment details retrieved successfully',
        data: paymentData
      });

    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment details',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private (Authorized users only)
router.get('/:id',
  protect,
  checkOrderAccess,
  async (req, res) => {
    try {
      const order = req.order;
      const userRole = req.userRole;

      res.json({
        success: true,
        message: 'Order details retrieved successfully',
        data: formatOrderResponse(order, userRole)
      });

    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order details',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Students only - within time limit)
router.put('/:id/cancel',
  protect,
  authorize('student'),
  checkStudentOrderOwnership,
  async (req, res) => {
    try {
      const { reason } = req.body;
      const order = req.order;

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage'
        });
      }

      // Check time limit for cancellation (e.g., within 5 minutes of placing order)
      const timeSinceOrder = Date.now() - order.createdAt.getTime();
      const cancellationTimeLimit = 5 * 60 * 1000; // 5 minutes

      if (timeSinceOrder > cancellationTimeLimit && order.status === 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled after 5 minutes of confirmation'
        });
      }

      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancellationReason = reason || 'Cancelled by customer';

      // If payment was completed, mark for refund
      if (order.paymentStatus === 'completed') {
        order.paymentStatus = 'refunded';
      }

      await order.save();

      console.log(`✅ Order cancelled: ${order.orderNumber} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          cancelledAt: order.cancelledAt,
          cancellationReason: order.cancellationReason,
          paymentStatus: order.paymentStatus
        }
      });

    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get order statistics (for dashboard)
// @route   GET /api/orders/stats/dashboard
// @access  Private (Restaurant owners only)
router.get('/stats/dashboard',
  protect,
  authorize('restaurant'),
  async (req, res) => {
    try {
      // Get restaurant owned by the user
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);

      // Get comprehensive statistics
      const stats = await Order.aggregate([
        { $match: { restaurantId: restaurant._id } },
        {
          $facet: {
            overall: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalRevenue: { $sum: { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] } },
                  averageOrderValue: { $avg: { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] } }
                }
              }
            ],
            today: [
              { $match: { createdAt: { $gte: today } } },
              {
                $group: {
                  _id: null,
                  todayOrders: { $sum: 1 },
                  todayRevenue: { $sum: { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] } }
                }
              }
            ],
            thisWeek: [
              { $match: { createdAt: { $gte: thisWeek } } },
              {
                $group: {
                  _id: null,
                  weekOrders: { $sum: 1 },
                  weekRevenue: { $sum: { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] } }
                }
              }
            ],
            thisMonth: [
              { $match: { createdAt: { $gte: thisMonth } } },
              {
                $group: {
                  _id: null,
                  monthOrders: { $sum: 1 },
                  monthRevenue: { $sum: { $add: [ { $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$deliveryFee', 0] }, { $ifNull: ['$tax', 0] } ] } }
                }
              }
            ],
            statusBreakdown: [
              { $match: { createdAt: { $gte: today } } }, // Only count today's orders for status breakdown
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ],
            recentOrders: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'users',
                  localField: 'studentId',
                  foreignField: '_id',
                  as: 'student'
                }
              },
              {
                $project: {
                  orderNumber: 1,
                  status: 1,
                  totalAmount: 1,
                  deliveryFee: 1,
                  tax: 1,
                  discount: 1,
                  createdAt: 1,
                  'student.name': 1
                }
              }
            ]
          }
        }
      ]);

      const result = stats[0];
      
      const dashboardStats = {
        overall: result.overall[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
        today: result.today[0] || { todayOrders: 0, todayRevenue: 0 },
        thisWeek: result.thisWeek[0] || { weekOrders: 0, weekRevenue: 0 },
        thisMonth: result.thisMonth[0] || { monthOrders: 0, monthRevenue: 0 },
        statusBreakdown: result.statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentOrders: result.recentOrders.map(order => {
          const subtotal = order.totalAmount || 0;
          const deliveryFee = order.deliveryFee || 0;
          const tax = order.tax || 0;
          const discount = (order.discount && typeof order.discount.amount === 'number') ? order.discount.amount : (order.discount || 0);
          const total = Math.max(0, subtotal + deliveryFee + tax - discount);
          return {
            _id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: total, // send final total to frontend list
            customerName: order.student[0]?.name || 'Unknown',
            createdAt: order.createdAt
          };
        })
      };

      res.json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: dashboardStats
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

module.exports = router;