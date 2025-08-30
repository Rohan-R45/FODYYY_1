import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNavigation from './components/BottomNavigation';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Protected Pages
import StudentDashboard from './pages/StudentDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import OrderDetails from './pages/OrderDetails';

// Additional Pages
const RestaurantList = React.lazy(() => import('./pages/RestaurantList'));
const RestaurantDetail = React.lazy(() => import('./pages/RestaurantDetail'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderDetail = React.lazy(() => import('./components/OrderDetail'));
const MenuPage = React.lazy(() => import('./pages/MenuPage'));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory'));
const Profile = React.lazy(() => import('./pages/Profile'));
const RestaurantProfile = React.lazy(() => import('./pages/RestaurantProfile'));
const MenuManagement = React.lazy(() => import('./pages/MenuManagement'));
const RestaurantOrders = React.lazy(() => import('./pages/RestaurantOrders'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));

// Error Pages
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.175.193-.39.398-.774.618-1.15A8.962 8.962 0 0112 13.5c2.34 0 4.5-.816 6.207-2.175-.193-.39-.398-.774-.618-1.15A7.962 7.962 0 0112 12z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">
        Go Home
      </a>
    </div>
  </div>
);

const ComingSoon = ({ title = "Coming Soon" }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">
        This feature is under development and will be available soon!
      </p>
      <button onClick={() => window.history.back()} className="btn btn-primary">
        Go Back
      </button>
    </div>
  </div>
);

// Component to conditionally render Footer
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Show footer only on home page
  if (location.pathname === '/') {
    return <Footer />;
  }
  
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <Router>
            <div className="App min-h-screen">
              <Navbar />
              
              {/* Main content with proper spacing for fixed navbar */}
              <main className="pt-16 pb-20 md:pb-0">
                <React.Suspense 
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Placeholder routes for footer links */}
              <Route path="/support" element={<ComingSoon title="Help & Support" />} />
              <Route path="/faq" element={<ComingSoon title="Frequently Asked Questions" />} />
              <Route path="/partner" element={<ComingSoon title="Partner with Us" />} />
              <Route path="/restaurant/guidelines" element={<ComingSoon title="Restaurant Guidelines" />} />
              
              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <PrivateRoute requiredRole="student">
                    <StudentDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurants" 
                element={
                  <PrivateRoute requiredRole="student">
                    <RestaurantList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurants/:id" 
                element={
                  <PrivateRoute requiredRole="student">
                    <RestaurantDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <PrivateRoute requiredRole="student">
                    <CartPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <PrivateRoute requiredRole="student">
                    <Checkout />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <PrivateRoute requiredRole="student">
                    <Orders />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <PrivateRoute requiredRole="student">
                    <OrderDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/order-tracking/:id" 
                element={
                  <PrivateRoute>
                    <OrderTracking />
                  </PrivateRoute>
                } 
              />
              
              {/* Restaurant Routes */}
              <Route 
                path="/restaurant" 
                element={
                  <PrivateRoute requiredRole="restaurant">
                    <RestaurantDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurant/profile" 
                element={
                  <PrivateRoute requiredRole="restaurant">
                    <RestaurantProfile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurant/menu" 
                element={
                  <PrivateRoute requiredRole="restaurant">
                    <MenuManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurant/orders" 
                element={
                  <PrivateRoute requiredRole="restaurant">
                    <RestaurantOrders />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurant/orders/:id" 
                element={
                  <PrivateRoute requiredRole="restaurant">
                    <OrderDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/restaurant/analytics" 
                element={
                  <PrivateRoute requiredRole="restaurant">
                    <ComingSoon title="Analytics Dashboard" />
                  </PrivateRoute>
                } 
              />
              
              {/* Common Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ComingSoon title="Profile Settings" />
                  </PrivateRoute>
                } 
              />
              
              {/* Redirect Routes */}
              <Route path="/dashboard" element={<Navigate to="/student" replace />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </main>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          {/* Conditional Footer - Only on Home Page */}
          <ConditionalFooter />
          
          {/* Bottom Navigation - Mobile Only. Render once at app root */}
          <BottomNavigation />
            </div>
            </Router>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;