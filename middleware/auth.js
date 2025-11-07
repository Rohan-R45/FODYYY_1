const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database and add to request
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found, token invalid'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      console.error('Token verification failed:', error.message);
      
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired, please login again'
        });
      }
      
      if (error.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          message: 'Token not active yet'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }
};

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // For restaurant owners, check if they own the restaurant
    if (req.user.role === 'restaurant') {
      // This will be used in restaurant-specific routes
      req.isOwner = true;
    }

    // For students, they can only access their own resources
    if (req.user.role === 'student') {
      req.isOwner = req.params.id === req.user._id.toString();
    }

    next();
  };
};

// Middleware to validate JWT secret exists
const validateJWTConfig = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  }
  next();
};

// Rate limiting helper (can be enhanced with redis)
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Count requests from this IP
    const userRequests = Array.from(requests.entries())
      .filter(([key]) => key.startsWith(ip))
      .length;
    
    if (userRequests >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    requests.set(`${ip}-${now}`, now);
    next();
  };
};

// Middleware to check order access permissions
const checkOrderAccess = async (req, res, next) => {
  try {
    const { Order } = require('../models');
    const orderId = req.params.id;

    // Find the order
    const order = await Order.findById(orderId).populate('restaurantId', 'ownerId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access based on user role
    let hasAccess = false;
    let userRole = 'student'; // default

    if (req.user.role === 'student') {
      // Students can only access their own orders
      hasAccess = order.studentId.toString() === req.user._id.toString();
      userRole = 'student';
    } else if (req.user.role === 'restaurant') {
      // Restaurant owners can access orders from their restaurant
      hasAccess = order.restaurantId.ownerId.toString() === req.user._id.toString();
      userRole = 'restaurant';
    } else if (req.user.role === 'admin') {
      // Admins can access all orders
      hasAccess = true;
      userRole = 'admin';
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order'
      });
    }

    // Add order and user role to request for use in route handler
    req.order = order;
    req.userRole = userRole;
    next();

  } catch (error) {
    console.error('Order access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify order access'
    });
  }
};

// Optional middleware to log authentication attempts
const logAuthAttempt = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`Auth attempt from IP: ${ip}, User-Agent: ${userAgent}`);
  next();
};

module.exports = { 
  protect, 
  authorize, 
  checkOwnership,
  validateJWTConfig,
  createRateLimiter,
  logAuthAttempt
};