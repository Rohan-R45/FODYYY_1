const express = require('express');
const mongoose = require('mongoose');
const { User, Restaurant, MenuItem, Order } = require('./models');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Create debug server
const app = express();
app.use(cors());
app.use(express.json());

// Add logging middleware
app.use('/api/orders', (req, res, next) => {
  console.log('\n📨 Incoming Order Request:');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Debug route to simulate order creation
app.post('/api/debug/order', async (req, res) => {
  try {
    console.log('\n🔍 Debug Order Creation:');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      restaurantId,
      items,
      deliveryAddress,
      phoneNumber,
      paymentMethod,
      specialInstructions
    } = req.body;

    // Check each field
    console.log('\n📋 Field Analysis:');
    console.log('restaurantId:', restaurantId, 'Type:', typeof restaurantId);
    console.log('items:', items, 'Length:', items?.length);
    console.log('deliveryAddress:', deliveryAddress, 'Length:', deliveryAddress?.length);
    console.log('phoneNumber:', phoneNumber, 'Type:', typeof phoneNumber);
    console.log('paymentMethod:', paymentMethod);
    console.log('specialInstructions:', specialInstructions);

    // Validate each field like the actual validation
    const errors = [];

    // Validate restaurantId
    if (!restaurantId) {
      errors.push({ field: 'restaurantId', message: 'Restaurant ID is required' });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    } else {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.menuItemId) {
          errors.push({ field: `items[${i}].menuItemId`, message: 'Menu item ID is required' });
        }
        if (!item.quantity || item.quantity < 1 || item.quantity > 10) {
          errors.push({ field: `items[${i}].quantity`, message: 'Quantity must be between 1 and 10' });
        }
      }
    }

    // Validate deliveryAddress
    if (!deliveryAddress || deliveryAddress.trim().length < 10) {
      errors.push({ field: 'deliveryAddress', message: 'Delivery address must be at least 10 characters long' });
    }

    // Validate phoneNumber
    if (!phoneNumber) {
      errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
    } else {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        errors.push({ field: 'phoneNumber', message: 'Phone number must be between 10-15 digits' });
      }
    }

    // Validate paymentMethod
    const validMethods = ['upi', 'cash_on_delivery', 'cod'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      errors.push({ field: 'paymentMethod', message: `Payment method must be one of: ${validMethods.join(', ')}` });
    }

    if (errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      errors.forEach(error => {
        console.log(`   ${error.field}: ${error.message}`);
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    console.log('\n✅ All validations passed!');
    
    res.json({
      success: true,
      message: 'Debug validation successful',
      data: {
        restaurantId,
        items: items.length,
        deliveryAddress: deliveryAddress.length + ' characters',
        phoneNumber: phoneNumber.replace(/\D/g, '').length + ' digits',
        paymentMethod,
        validationStatus: 'PASSED'
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// Start debug server
async function startDebugServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    app.listen(5001, () => {
      console.log('🔍 Debug server running on port 5001');
      console.log('📍 Test endpoint: POST http://localhost:5001/api/debug/order');
      console.log('\n📝 Test with this curl command:');
      console.log(`curl -X POST http://localhost:5001/api/debug/order \\
  -H "Content-Type: application/json" \\
  -d '{
    "restaurantId": "68592e1b67f9c145483d6554",
    "items": [{"menuItemId": "685aeb03ee9cec0e61e0e598", "quantity": 2}],
    "deliveryAddress": "Room 101, Hostel Block A, University Campus",
    "phoneNumber": "9876543210",
    "paymentMethod": "cod",
    "specialInstructions": "Please call before delivery"
  }'`);
    });
  } catch (error) {
    console.error('Failed to start debug server:', error);
  }
}

startDebugServer();