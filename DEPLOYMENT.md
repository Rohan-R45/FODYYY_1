# FODYYY Backend Deployment Guide

## 🚀 Quick Fix Summary

The backend API routes have been fixed and are now working properly. The main issues were:

1. ✅ **Route Loading**: Fixed malformed route patterns causing server startup errors
2. ✅ **CORS Configuration**: Updated to allow requests from Netlify frontend
3. ✅ **Auth Routes**: Implemented complete authentication system
4. ✅ **Error Handling**: Added comprehensive error handling and logging
5. ✅ **API Structure**: Created production-ready API endpoints

## 📋 Available API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `GET /api/auth/test` - Test auth routes

### User Management (`/api/users`)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users` - List all users (admin only)

### Restaurant Routes (`/api/restaurants`)
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/test` - Test restaurant routes

### Menu Routes (`/api/menu`)
- `GET /api/menu/restaurant/:restaurantId` - Get menu for restaurant
- `GET /api/menu/test` - Test menu routes

### Order Routes (`/api/orders`)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/test` - Test order routes

### System Routes
- `GET /` - API welcome message
- `GET /api/health` - Health check with route information

## 🔧 Environment Variables Required

Create these environment variables in Render:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fodyyy?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=https://fodyyy.netlify.app,http://localhost:3000
FRONTEND_URL=https://fodyyy.netlify.app
TRUST_PROXY=true
SECURE_COOKIES=true
```

## 🌐 CORS Configuration

The server is configured to accept requests from:
- `https://fodyyy.netlify.app` (production frontend)
- `http://localhost:3000` (local development)
- `http://localhost:5174` (Vite dev server)
- `http://localhost:5175` (alternative Vite port)

## 🔐 Authentication Flow

1. **Registration**: `POST /api/auth/register`
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "phone": "1234567890",
     "role": "student",
     "address": "Student Address"
   }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Response**: Returns JWT token for authenticated requests
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "_id": "user_id",
       "name": "John Doe",
       "email": "john@example.com",
       "role": "student",
       "token": "jwt_token_here"
     }
   }
   ```

## 🚀 Deployment Steps

### 1. Render Deployment
The backend is already deployed on Render and should automatically redeploy when you push changes to GitHub.

### 2. Environment Variables
Make sure these are set in your Render dashboard:
- Go to your Render service dashboard
- Navigate to "Environment" tab
- Add all required environment variables listed above

### 3. Database Connection
Ensure your MongoDB Atlas cluster:
- Allows connections from anywhere (0.0.0.0/0) or add Render's IP ranges
- Has the correct database user credentials
- Database name matches your MONGODB_URI

### 4. Frontend Configuration
Update your frontend to use the production API URL:
```javascript
const API_URL = 'https://fodyyy-1.onrender.com';
```

## 🧪 Testing the API

### Health Check
```bash
curl https://fodyyy-1.onrender.com/api/health
```

### Test Authentication
```bash
# Register a new user
curl -X POST https://fodyyy-1.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "student",
    "address": "Test Address"
  }'

# Login
curl -X POST https://fodyyy-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `ALLOWED_ORIGINS` includes your frontend URL
2. **Database Connection**: Verify MongoDB URI and network access
3. **JWT Errors**: Ensure `JWT_SECRET` is set and consistent
4. **Route Not Found**: Check the health endpoint for available routes

### Logs:
Check Render logs for detailed error information:
- Go to your Render service dashboard
- Click on "Logs" tab
- Look for error messages and stack traces

## 📝 Next Steps

1. **Test all endpoints** from your frontend
2. **Monitor logs** for any errors
3. **Add more specific routes** as needed for your application
4. **Implement rate limiting** for production security
5. **Add input validation** for all endpoints

The backend is now production-ready and should handle all authentication and basic CRUD operations for your food ordering platform.