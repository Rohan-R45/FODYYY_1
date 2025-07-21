import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BottomNavigation = () => {
  const { isAuthenticated, isStudent, isRestaurantOwner } = useAuth();
  const { getCartItemsCount } = useCart();
  const location = useLocation();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Don't show bottom nav on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden mobile-safe-area">
      <div className="flex items-center justify-around py-2">
        {isStudent() && (
          <>
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </Link>

            {/* Restaurants */}
            <Link
              to="/restaurants"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/restaurants') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
              <span className="text-xs font-medium">Restaurants</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors relative ${
                isActivePath('/cart') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <div className="relative">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18" />
                </svg>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FF6B35] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getCartItemsCount()}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">Cart</span>
            </Link>

            {/* Orders */}
            <Link
              to="/orders"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/orders') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium">Orders</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/profile') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </>
        )}

        {isRestaurantOwner() && (
          <>
            {/* Dashboard */}
            <Link
              to="/restaurant"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/restaurant') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Dashboard</span>
            </Link>

            {/* Orders */}
            <Link
              to="/restaurant/orders"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/restaurant/orders') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium">Orders</span>
            </Link>

            {/* Menu */}
            <Link
              to="/restaurant/menu"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/restaurant/menu') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-medium">Menu</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px] transition-colors ${
                isActivePath('/profile') 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-[#FF6B35]'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;