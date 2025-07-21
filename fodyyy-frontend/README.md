# FODYYY - IIT Tirupati Food Delivery Platform

A modern, responsive food delivery platform built specifically for IIT Tirupati campus, connecting students with local restaurants.

## 🚀 Features

### Authentication System
- **Dual Role Registration**: Separate registration flows for Students and Restaurant Owners
- **Secure Login**: JWT-based authentication with role validation
- **Password Recovery**: Forgot password functionality with email verification
- **Protected Routes**: Role-based access control for different user types
- **Auto Token Refresh**: Seamless token renewal for uninterrupted sessions

### Student Features
- Browse restaurants and menus
- Place and track orders
- Order history and favorites
- Profile management
- Real-time order updates

### Restaurant Features
- Restaurant dashboard and analytics
- Menu management
- Order processing and tracking
- Customer insights
- Revenue analytics

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom IIT theme
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fodyyy-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=FODYYY
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with role-based menus
│   ├── PrivateRoute.jsx # Route protection component
│   └── LoadingSpinner.jsx # Loading states
├── pages/              # Application pages
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Authentication page
│   ├── Register.jsx    # User registration
│   ├── ForgotPassword.jsx # Password recovery
│   ├── StudentDashboard.jsx # Student interface
│   └── RestaurantDashboard.jsx # Restaurant interface
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication state management
├── services/           # API service functions
│   ├── api.js         # Axios configuration & interceptors
│   ├── authService.js # Authentication API calls
│   ├── restaurantService.js # Restaurant management
│   ├── menuService.js # Menu operations
│   └── orderService.js # Order management
├── utils/              # Helper functions
│   └── helpers.js     # Utility functions
└── App.jsx            # Main app with routing
```

## 🔐 Authentication Flow

### Registration Process

#### Student Registration
```javascript
{
  name: "John Doe",
  email: "john.doe@iittp.ac.in",
  password: "securePassword123",
  phone: "+91 9876543210",
  role: "student",
  hostelAddress: "Hostel A, IIT Tirupati",
  roomNumber: "A-101"
}
```

#### Restaurant Registration
```javascript
{
  name: "Contact Person",
  email: "restaurant@example.com",
  password: "securePassword123",
  phone: "+91 9876543210",
  role: "restaurant",
  ownerName: "Restaurant Owner",
  restaurantName: "Delicious Bites",
  restaurantAddress: "123 Food Street, Tirupati",
  description: "Authentic South Indian cuisine...",
  cuisineTypes: ["South Indian", "North Indian"]
}
```

### Login Process
1. User selects role (Student/Restaurant)
2. Enters credentials
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. User redirected to role-specific dashboard

### Token Management
- **Automatic Refresh**: Tokens refreshed before expiration
- **Secure Storage**: JWT stored in localStorage with expiration
- **Request Interceptors**: Auto-attach tokens to API requests
- **Error Handling**: Automatic logout on token expiration

## 🎨 UI/UX Features

### Design System
- **IIT Theme Colors**: 
  - Primary Blue: `#2563eb`
  - Accent Orange: `#f97316`
- **Responsive Design**: Mobile-first approach
- **Consistent Components**: Reusable button, input, and card styles
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators
- Semantic HTML structure

## 🔧 API Integration

### Base Configuration
```javascript
// API base URL
const API_URL = 'http://localhost:5000/api'

// Endpoints
POST /auth/login
POST /auth/register
POST /auth/logout
GET  /auth/validate
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

### Request/Response Format
```javascript
// Request
{
  email: "user@example.com",
  password: "password123",
  expectedRole: "student"
}

// Response
{
  success: true,
  data: {
    token: "jwt_token_here",
    user: {
      id: "user_id",
      name: "User Name",
      email: "user@example.com",
      role: "student"
    }
  }
}
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for students and restaurants
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Token-based request validation
- **Password Security**: Minimum length and complexity requirements

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Large touch targets and gestures

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Environment Variables
```env
# Production
VITE_API_URL=https://api.fodyyy.com
VITE_NODE_ENV=production
VITE_ENABLE_ANALYTICS=true
```

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📈 Performance

- **Code Splitting**: Lazy loading for better performance
- **Bundle Optimization**: Vite's optimized bundling
- **Image Optimization**: Responsive images and lazy loading
- **Caching Strategy**: Efficient API response caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Complete authentication system
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Student and restaurant dashboards
- ✅ Password recovery system
- ✅ JWT token management

### Upcoming Features
- 🔄 Restaurant listing and search
- 🔄 Menu management system
- 🔄 Order placement and tracking
- 🔄 Payment integration
- 🔄 Real-time notifications
- 🔄 Analytics dashboard

---

**Built with ❤️ for IIT Tirupati Community**