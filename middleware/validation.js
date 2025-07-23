// Input validation middleware
const validator = require('validator');
const { body, validationResult } = require('express-validator');

// Email validation
const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!validator.isEmail(email)) {
    return 'Please provide a valid email address';
  }
  
  // Additional email format checks
  if (email.length > 254) {
    return 'Email address is too long';
  }
  
  return null;
};

// Password validation
const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (password.length > 128) {
    return 'Password is too long (max 128 characters)';
  }
  
  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  
  return null;
};

// Phone number validation
const validatePhone = (phone) => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return 'Phone number must be between 10-15 digits';
  }
  
  if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
    return 'Please provide a valid phone number';
  }
  
  return null;
};

// Name validation
const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (name.length > 50) {
    return 'Name cannot exceed 50 characters';
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
};

// Address validation
const validateAddress = (address, required = true) => {
  if (!address && required) {
    return 'Address is required';
  }
  
  if (address && address.trim().length < 10) {
    return 'Address must be at least 10 characters long';
  }
  
  if (address && address.length > 200) {
    return 'Address cannot exceed 200 characters';
  }
  
  return null;
};

// Role validation
const validateRole = (role) => {
  const validRoles = ['student', 'restaurant'];
  
  if (!role) {
    return 'Role is required';
  }
  
  if (!validRoles.includes(role)) {
    return `Role must be one of: ${validRoles.join(', ')}`;
  }
  
  return null;
};

// Registration validation middleware
const validateRegistration = (req, res, next) => {
  const { name, email, password, role, phone, address } = req.body;
  const errors = [];
  
  // Validate required fields
  const nameError = validateName(name);
  if (nameError) errors.push({ field: 'name', message: nameError });
  
  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });
  
  const roleError = validateRole(role);
  if (roleError) errors.push({ field: 'role', message: roleError });
  
  const phoneError = validatePhone(phone);
  if (phoneError) errors.push({ field: 'phone', message: phoneError });
  
  // Address is required for students
  if (role === 'student') {
    const addressError = validateAddress(address, true);
    if (addressError) errors.push({ field: 'address', message: addressError });
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  // Sanitize inputs
  req.body.name = validator.escape(name.trim());
  req.body.email = validator.normalizeEmail(email);
  req.body.phone = phone.trim();
  if (address) {
    req.body.address = validator.escape(address.trim());
  }
  
  next();
};

// Login validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  // Sanitize email
  req.body.email = validator.normalizeEmail(email);
  
  next();
};

// Profile update validation middleware
const validateProfileUpdate = (req, res, next) => {
  const { name, phone, address } = req.body;
  const errors = [];
  
  // Only validate fields that are being updated
  if (name !== undefined) {
    const nameError = validateName(name);
    if (nameError) errors.push({ field: 'name', message: nameError });
  }
  
  if (phone !== undefined) {
    const phoneError = validatePhone(phone);
    if (phoneError) errors.push({ field: 'phone', message: phoneError });
  }
  
  if (address !== undefined) {
    // Address validation depends on user role
    const isStudent = req.user && req.user.role === 'student';
    const addressError = validateAddress(address, isStudent);
    if (addressError) errors.push({ field: 'address', message: addressError });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  // Sanitize inputs
  if (name !== undefined) {
    req.body.name = validator.escape(name.trim());
  }
  if (phone !== undefined) {
    req.body.phone = phone.trim();
  }
  if (address !== undefined) {
    req.body.address = validator.escape(address.trim());
  }
  
  next();
};

// Password change validation middleware
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const errors = [];
  
  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    errors.push({ field: 'newPassword', message: passwordError });
  }
  
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Password confirmation is required' });
  }
  
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push({ field: 'newPassword', message: 'New password must be different from current password' });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

// Generic validation helper
const createValidator = (rules) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      const error = rule(value);
      if (error) {
        errors.push({ field, message: error });
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    next();
  };
};

// Express-validator based validation helper
const createExpressValidator = (validationRules) => {
  return [
    ...validationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
          }))
        });
      }
      next();
    }
  ];
};

// Common express-validator rules
const commonValidationRules = {
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  phone: body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  role: body('role')
    .isIn(['student', 'restaurant'])
    .withMessage('Role must be either student or restaurant')
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS attacks
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateAddress,
  validateRole,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  createValidator,
  createExpressValidator,
  commonValidationRules,
  sanitizeInput
};