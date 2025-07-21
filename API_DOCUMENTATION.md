# FODYYY API Documentation

## Overview
FODYYY is a food delivery platform API that connects students with campus restaurants. This API provides comprehensive functionality for user authentication, restaurant management, menu management, and order processing.

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [] // Validation errors (if applicable)
}
```

---

## Authentication Routes (`/api/auth`)

### Register User
**POST** `/api/auth/register`
- **Access**: Public
- **Description**: Register a new user (student or restaurant owner)
- **Rate Limit**: 5 requests per 15 minutes per IP

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student", // or "restaurant"
  "phone": "+1234567890",
  "address": "123 Main St" // Required for students only
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "+1234567890",
    "address": "123 Main St",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "token": "jwt_token_here"
  }
}
```

### Login User
**POST** `/api/auth/login`
- **Access**: Public
- **Rate Limit**: 3 requests per 15 minutes per IP

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
**GET** `/api/auth/me`
- **Access**: Private (requires authentication)

### Update Profile
**PUT** `/api/auth/profile`
- **Access**: Private

**Request Body**:
```json
{
  "name": "Updated Name",
  "phone": "+1987654321",
  "address": "New Address"
}
```

### Change Password
**PUT** `/api/auth/change-password`
- **Access**: Private

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Logout
**POST** `/api/auth/logout`
- **Access**: Private

### Refresh Token
**POST** `/api/auth/refresh`
- **Access**: Private

---

## Restaurant Routes (`/api/restaurants`)

### Get All Restaurants
**GET** `/api/restaurants`
- **Access**: Public
- **Description**: Get all active restaurants with pagination and filtering

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `search` - Search in name, description, cuisine
- `cuisine` - Filter by cuisine (comma-separated)
- `sortBy` (default: 'rating')
- `sortOrder` (default: 'desc')
- `minRating` - Minimum rating filter
- `maxRating` - Maximum rating filter
- `priceRange` - Filter by price range ($, $$, $$$, $$$$)

**Example**: `/api/restaurants?search=pizza&cuisine=Italian,American&minRating=4&page=1&limit=5`

### Get Single Restaurant
**GET** `/api/restaurants/:id`
- **Access**: Public
- **Description**: Get restaurant details with menu items grouped by category

**Response**:
```json
{
  "success": true,
  "message": "Restaurant details retrieved successfully",
  "data": {
    "restaurant": {
      "_id": "restaurant_id",
      "name": "Restaurant Name",
      "description": "Restaurant description",
      "address": "Restaurant address",
      "phone": "+1234567890",
      "rating": 4.5,
      "totalRatings": 100,
      "cuisine": ["Italian", "American"],
      "priceRange": "$$",
      "deliveryTime": "30-45 mins",
      "isActive": true
    },
    "menuItems": {
      "Appetizer": [...],
      "Main Course": [...],
      "Dessert": [...],
      "Beverages": [...]
    },
    "stats": {
      "totalMenuItems": 25,
      "categoriesCount": 4,
      "averagePrice": 12.50
    }
  }
}
```

### Create Restaurant
**POST** `/api/restaurants`
- **Access**: Private (Restaurant owners only)

**Request Body**:
```json
{
  "name": "My Restaurant",
  "description": "Restaurant description",
  "address": "123 Restaurant St",
  "phone": "+1234567890",
  "image": "https://example.com/image.jpg",
  "deliveryTime": "30-45 mins",
  "cuisine": ["Italian", "American"],
  "priceRange": "$$"
}
```

### Update Restaurant
**PUT** `/api/restaurants/:id`
- **Access**: Private (Owner only)

### Deactivate Restaurant
**DELETE** `/api/restaurants/:id`
- **Access**: Private (Owner only)
- **Description**: Soft delete - deactivates restaurant and all menu items

### Reactivate Restaurant
**PATCH** `/api/restaurants/:id/reactivate`
- **Access**: Private (Owner only)

### Get Restaurant Statistics
**GET** `/api/restaurants/:id/stats`
- **Access**: Private (Owner only)

---

## Menu Routes (`/api/menu`)

### Get Restaurant Menu
**GET** `/api/menu/restaurant/:restaurantId`
- **Access**: Public
- **Description**: Get all menu items for a specific restaurant

**Query Parameters**:
- `category` - Filter by category
- `available` (default: 'true') - Filter by availability
- `sortBy` (default: 'category')
- `sortOrder` (default: 'asc')
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `vegetarian` - Filter vegetarian items
- `vegan` - Filter vegan items
- `spiceLevel` - Filter by spice level
- `search` - Search in name, description, ingredients

**Example**: `/api/menu/restaurant/123?category=Main Course&vegetarian=true&minPrice=10&maxPrice=20`

### Get Menu Item Details
**GET** `/api/menu/:id`
- **Access**: Public

### Add Menu Item
**POST** `/api/menu`
- **Access**: Private (Restaurant owners only)

**Request Body**:
```json
{
  "restaurantId": "restaurant_id",
  "name": "Margherita Pizza",
  "description": "Classic pizza with fresh ingredients",
  "price": 12.99,
  "category": "Main Course",
  "image": "https://example.com/pizza.jpg",
  "preparationTime": 20,
  "ingredients": ["Tomato sauce", "Mozzarella", "Basil"],
  "allergens": ["Dairy", "Gluten"],
  "isVegetarian": true,
  "isVegan": false,
  "spiceLevel": "Mild",
  "nutritionalInfo": {
    "calories": 280,
    "protein": 12,
    "carbs": 35,
    "fat": 10
  }
}
```

**Valid Categories**:
- Appetizer
- Main Course
- Dessert
- Beverages
- Snacks

**Valid Allergens**:
- Nuts, Dairy, Gluten, Soy, Eggs, Shellfish, Fish, Sesame

**Valid Spice Levels**:
- Mild, Medium, Hot, Extra Hot, Not Applicable

### Update Menu Item
**PUT** `/api/menu/:id`
- **Access**: Private (Owner only)

### Delete Menu Item
**DELETE** `/api/menu/:id`
- **Access**: Private (Owner only)

### Toggle Menu Item Availability
**PUT** `/api/menu/:id/toggle`
- **Access**: Private (Owner only)
- **Description**: Toggle item availability (available/unavailable)

### Bulk Toggle Menu Items
**PUT** `/api/menu/bulk/toggle`
- **Access**: Private (Owner only)

**Request Body**:
```json
{
  "menuItemIds": ["item_id_1", "item_id_2"],
  "isAvailable": false
}
```

---

## Order Routes (`/api/orders`)

### Place New Order
**POST** `/api/orders`
- **Access**: Private (Students only)
- **Description**: Place a new food order

**Request Body**:
```json
{
  "restaurantId": "restaurant_id",
  "items": [
    {
      "menuItemId": "menu_item_id",
      "quantity": 2,
      "specialInstructions": "Extra cheese please"
    },
    {
      "menuItemId": "menu_item_id_2",
      "quantity": 1,
      "specialInstructions": "No onions"
    }
  ],
  "deliveryAddress": "123 Delivery Street, City, State 12345",
  "phoneNumber": "+1234567890",
  "paymentMethod": "upi", // or "cash_on_delivery"
  "specialInstructions": "Please ring doorbell twice"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-1234567890-ABCD",
    "status": "pending",
    "totalAmount": 28.48,
    "deliveryAddress": "123 Delivery Street, City, State 12345",
    "phoneNumber": "+1234567890",
    "paymentMethod": "upi",
    "paymentStatus": "pending",
    "estimatedDeliveryTime": "2024-01-01T13:30:00.000Z",
    "items": [
      {
        "menuItem": {
          "_id": "menu_item_id",
          "name": "Margherita Pizza",
          "price": 12.99,
          "category": "Main Course"
        },
        "quantity": 2,
        "price": 12.99,
        "specialInstructions": "Extra cheese please",
        "subtotal": 25.98
      }
    ],
    "restaurant": {
      "_id": "restaurant_id",
      "name": "Pizza Palace",
      "address": "123 Restaurant St",
      "phone": "+1555123456"
    },
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get Student Order History
**GET** `/api/orders/student`
- **Access**: Private (Students only)

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `status` - Filter by order status
- `sortBy` (default: 'createdAt')
- `sortOrder` (default: 'desc')
- `startDate` - Filter orders from date
- `endDate` - Filter orders to date

**Example**: `/api/orders/student?status=delivered&page=1&limit=5`

### Get Restaurant Orders
**GET** `/api/orders/restaurant`
- **Access**: Private (Restaurant owners only)
- **Description**: Get all orders for the restaurant owned by authenticated user

**Query Parameters**: Same as student orders

### Get Single Order Details
**GET** `/api/orders/:id`
- **Access**: Private (Order owner or restaurant owner only)
- **Description**: Get detailed order information

### Update Order Status
**PUT** `/api/orders/:id/status`
- **Access**: Private (Restaurant owners only)
- **Description**: Update order status through valid transitions

**Request Body**:
```json
{
  "status": "confirmed" // Valid transitions based on current status
}
```

**Valid Status Flow**:
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `preparing` or `cancelled`
- `preparing` → `ready` or `cancelled`
- `ready` → `out_for_delivery`
- `out_for_delivery` → `delivered`
- `delivered` (final state)
- `cancelled` (final state)

### Confirm Payment
**PUT** `/api/orders/:id/payment`
- **Access**: Private (Students only - order owner)
- **Description**: Update payment status for UPI orders

**Request Body**:
```json
{
  "paymentStatus": "completed", // "pending", "completed", "failed", "refunded"
  "transactionId": "UPI123456789"
}
```

### Cancel Order
**PUT** `/api/orders/:id/cancel`
- **Access**: Private (Students only - order owner)
- **Description**: Cancel order within time limit

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Cancellation Rules**:
- Can cancel `pending` orders anytime
- Can cancel `confirmed` orders within 5 minutes
- Cannot cancel orders in `preparing`, `ready`, `out_for_delivery`, or `delivered` status

### Get Dashboard Statistics
**GET** `/api/orders/stats/dashboard`
- **Access**: Private (Restaurant owners only)
- **Description**: Get comprehensive order statistics for restaurant dashboard

**Response**:
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalOrders": 150,
      "totalRevenue": 2500.50,
      "averageOrderValue": 16.67
    },
    "today": {
      "todayOrders": 12,
      "todayRevenue": 180.50
    },
    "thisWeek": {
      "weekOrders": 45,
      "weekRevenue": 750.25
    },
    "thisMonth": {
      "monthOrders": 120,
      "monthRevenue": 2000.00
    },
    "statusBreakdown": {
      "pending": 3,
      "confirmed": 2,
      "preparing": 1,
      "delivered": 140,
      "cancelled": 4
    },
    "recentOrders": [
      {
        "_id": "order_id",
        "orderNumber": "ORD-123",
        "status": "pending",
        "totalAmount": 15.99,
        "customerName": "John Doe",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

## Utility Routes

### Health Check
**GET** `/api/health`
- **Access**: Public

### Database Statistics
**GET** `/api/stats`
- **Access**: Public

**Response**:
```json
{
  "success": true,
  "data": {
    "users": 150,
    "restaurants": 25,
    "menuItems": 500,
    "orders": 1200,
    "activeRestaurants": 23,
    "availableMenuItems": 480,
    "pendingOrders": 15,
    "deliveredOrders": 1100
  }
}
```

---

## Error Codes

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

### Common Error Responses

**Validation Error (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

**Authentication Error (401)**:
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

**Authorization Error (403)**:
```json
{
  "success": false,
  "message": "Access denied. Required role: restaurant. Your role: student"
}
```

**Not Found Error (404)**:
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

**Rate Limit Error (429)**:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (student/restaurant)
- Resource ownership verification
- Account activation status checking

### Rate Limiting
- Authentication routes: 5 requests per 15 minutes
- Login routes: 3 requests per 15 minutes
- General API protection available

### Input Validation
- Comprehensive field validation
- XSS protection through input sanitization
- SQL injection prevention through Mongoose ODM
- File upload validation (for images)

### Data Protection
- Password hashing with bcrypt
- Sensitive data exclusion from responses
- Environment variable configuration
- CORS protection

---

## Database Models

### User Model
- Authentication and profile management
- Role-based permissions (student/restaurant)
- Account status tracking

### Restaurant Model
- Restaurant profile and business information
- Owner relationship and verification
- Rating and review system integration
- Soft delete functionality

### MenuItem Model
- Comprehensive menu item details
- Nutritional information and dietary preferences
- Pricing and availability management
- Restaurant relationship and ownership

### Order Model (Future Implementation)
- Order processing and status tracking
- Payment integration
- Delivery management
- Rating and review system

---

## Testing

### Test Scripts Available
- `test-models.js` - Database models and basic API testing
- `test-restaurants.js` - Restaurant management routes testing
- `test-menu.js` - Menu management routes testing

### Running Tests
```bash
# Start the server
npm run dev

# In another terminal, run tests
node test-models.js
node test-restaurants.js
node test-menu.js
```

---

## Environment Variables

Required environment variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/fodyyy
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
```

---

## Future Enhancements

### Planned Features
1. **Order Management System**
   - Order placement and tracking
   - Payment integration
   - Delivery status updates

2. **Rating & Review System**
   - Restaurant and food ratings
   - Review management
   - Rating aggregation

3. **Advanced Search & Filtering**
   - Geolocation-based search
   - Advanced filtering options
   - Recommendation system

4. **Admin Panel**
   - System administration
   - User and restaurant management
   - Analytics and reporting

5. **Real-time Features**
   - Order status notifications
   - Live chat support
   - Real-time delivery tracking

### Technical Improvements
- Redis integration for caching and sessions
- File upload handling for images
- Email notification system
- Advanced logging and monitoring
- API versioning
- GraphQL integration option

---

## Support

For technical support or questions about the API, please refer to the test scripts and documentation provided. The API includes comprehensive error handling and validation to guide proper usage.