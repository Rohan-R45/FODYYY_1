# FODYYY - Food Delivery Platform

A full-stack food delivery application built with React.js frontend and Node.js/Express backend, featuring real-time order tracking, payment integration, and role-based access control.

## 🚀 Features

### Frontend (React + Vite)
- ✅ Modern React 19 with Vite build system
- ✅ Responsive design with Tailwind CSS
- ✅ Role-based authentication (Students & Restaurants)
- ✅ Real-time order tracking
- ✅ Shopping cart functionality
- ✅ UPI payment integration
- ✅ Progressive Web App (PWA) ready
- ✅ Error boundaries and loading states
- ✅ Toast notifications

### Backend (Node.js + Express)
- ✅ RESTful API with Express.js
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication & authorization
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting and security middleware
- ✅ File upload handling
- ✅ Comprehensive error handling
- ✅ Environment-based configuration
- ✅ Production-ready logging

## 🏗️ Architecture

```
FODYYY/
├── fodyyy-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API service functions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── dist/                # Production build output
├── config/                  # Backend configuration
├── middleware/              # Express middleware
├── models/                  # MongoDB models
├── routes/                  # API routes
├── utils/                   # Backend utilities
└── server.js               # Main server file
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **File Processing**: Multer
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (recommended) or local MongoDB
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FODYYY
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
# See "Environment Configuration" section below

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd fodyyy-frontend

# Install frontend dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure frontend environment variables
# See "Environment Configuration" section below

# Start development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fodyyy

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000

# Security Configuration
BCRYPT_SALT_ROUNDS=12
```

### Frontend Environment Variables

Create `.env` file in the `fodyyy-frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=FODYYY
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Update `MONGODB_URI` in your `.env` file

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/fodyyy` as your `MONGODB_URI`

## 📦 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run start:prod # Start production server with NODE_ENV=production
npm run build      # Prepare for production build
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables: Set `VITE_API_URL` to your backend URL

#### Vercel
1. Framework preset: Vite
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables: Set `VITE_API_URL` to your backend URL

### Backend Deployment (Heroku/Railway)

#### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set FRONTEND_URL=your_frontend_url
git push heroku main
```

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create restaurant (auth required)
- `PUT /api/restaurants/:id` - Update restaurant (auth required)

### Menu Items
- `GET /api/menu/:restaurantId` - Get restaurant menu
- `POST /api/menu` - Create menu item (restaurant auth)
- `PUT /api/menu/:id` - Update menu item (restaurant auth)
- `DELETE /api/menu/:id` - Delete menu item (restaurant auth)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (restaurant auth)

## 🧪 Testing

### Backend Testing
```bash
# Run API tests
npm test

# Test specific endpoints
node test-auth-endpoints.js
node test-complete-system.js
```

### Frontend Testing
```bash
# Run frontend tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload during development:
- Backend: Uses nodemon for automatic server restart
- Frontend: Uses Vite's HMR for instant updates

### Debugging
- Backend logs are available in the console
- Frontend: Use React Developer Tools
- API testing: Use Postman or Thunder Client

### Code Quality
- ESLint configuration for consistent code style
- Prettier for code formatting
- Pre-commit hooks for code quality

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your MongoDB URI
   - Ensure network access is allowed in MongoDB Atlas
   - Verify database user credentials

2. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in backend `.env`
   - Ensure frontend URL matches the allowed origins

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for JSX syntax in .js files (should be .jsx)
   - Verify all environment variables are set

4. **Authentication Issues**
   - Check JWT_SECRET is set and consistent
   - Verify token expiration settings
   - Clear browser localStorage/cookies

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@fodyyy.com or create an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- MongoDB team
- All open source contributors

---

**Made with ❤️ by the FODYYY Team**
