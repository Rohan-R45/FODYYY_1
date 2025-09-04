import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getInitials } from '../utils/helpers';

const Navbar = () => {
  const { isAuthenticated, user, logout, isStudent, isRestaurantOwner } = useAuth();
  const { getCartItemsCount, cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Mock search suggestions (in real app, fetch from API)
  const searchSuggestions = [
    'Biryani', 'Pizza', 'Burger', 'South Indian', 'North Indian', 
    'Chinese', 'Samosa', 'Dosa', 'Pasta', 'Chicken Curry'
  ].filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  ).slice(0, 5);

  // Don't show navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 mobile-safe-area ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white shadow-sm border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="text-white text-lg">
                    🍽️
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F7931E] rounded-full animate-pulse"></div>
              </div>
              <div className="block">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent">
                  FODYYY
                </span>
                <div className="text-xs text-gray-500 -mt-1 hidden sm:block">IIT & IISER Tirupati</div>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            {isAuthenticated && isStudent() && (
              <div className="hidden lg:flex flex-1 max-w-md mx-8" ref={searchRef}>
                <div className="relative w-full">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder="Search restaurants, cuisines, dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchOpen(true)}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-transparent rounded-full text-[#2D3748] placeholder-gray-500 focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all duration-300 shadow-sm"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </form>
                  
                  {/* Search Suggestions */}
                  {isSearchOpen && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            navigate(`/restaurants?search=${encodeURIComponent(suggestion)}`);
                            setIsSearchOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-[#2D3748]">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`relative py-2 px-4 text-[#2D3748] font-medium transition-all duration-300 hover:text-[#FF6B35] ${
                      isActivePath('/') ? 'text-[#FF6B35]' : ''
                    }`}
                  >
                    Home
                    {isActivePath('/') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"></div>
                    )}
                  </Link>
                  <Link
                    to="/login"
                    className="py-2 px-4 text-[#2D3748] font-medium hover:text-[#FF6B35] transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 min-h-[44px] flex items-center"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {/* Student Navigation */}
                  {isStudent() && (
                    <>
                      <Link
                        to="/restaurants"
                        className={`relative py-2 px-4 text-[#2D3748] font-medium transition-all duration-300 hover:text-[#FF6B35] ${
                          isActivePath('/restaurants') ? 'text-[#FF6B35]' : ''
                        }`}
                      >
                        Restaurants
                        {isActivePath('/restaurants') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"></div>
                        )}
                      </Link>
                      <Link
                        to="/orders"
                        className={`relative py-2 px-4 text-[#2D3748] font-medium transition-all duration-300 hover:text-[#FF6B35] ${
                          isActivePath('/orders') ? 'text-[#FF6B35]' : ''
                        }`}
                      >
                        Orders
                        {isActivePath('/orders') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"></div>
                        )}
                      </Link>
                      
                      {/* Floating Cart Button */}
                      <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="relative bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white p-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18" />
                        </svg>
                        {getCartItemsCount() > 0 && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                            {getCartItemsCount()}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  {/* Restaurant Navigation */}
                  {isRestaurantOwner() && (
                    <>
                      <Link
                        to="/restaurant"
                        className={`relative py-2 px-4 text-[#2D3748] font-medium transition-all duration-300 hover:text-[#FF6B35] ${
                          isActivePath('/restaurant') ? 'text-[#FF6B35]' : ''
                        }`}
                      >
                        Dashboard
                        {isActivePath('/restaurant') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"></div>
                        )}
                      </Link>
                      <Link
                        to="/restaurant/orders"
                        className={`relative py-2 px-4 text-[#2D3748] font-medium transition-all duration-300 hover:text-[#FF6B35] ${
                          isActivePath('/restaurant/orders') ? 'text-[#FF6B35]' : ''
                        }`}
                      >
                        Orders
                        {isActivePath('/restaurant/orders') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"></div>
                        )}
                      </Link>
                      <Link
                        to="/restaurant/menu"
                        className={`relative py-2 px-4 text-[#2D3748] font-medium transition-all duration-300 hover:text-[#FF6B35] ${
                          isActivePath('/restaurant/menu') ? 'text-[#FF6B35]' : ''
                        }`}
                      >
                        Menu
                        {isActivePath('/restaurant/menu') && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"></div>
                        )}
                      </Link>
                    </>
                  )}

                  {/* Modern Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-50 transition-all duration-300 min-h-[44px]"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {getInitials(user?.name)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-[#2D3748]">{user?.name}</p>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isStudent() 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                          isProfileMenuOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Modern Profile Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-down">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#FF6B35]/5 to-[#F7931E]/5">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold">
                                {getInitials(user?.name)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-[#2D3748]">{user?.name}</p>
                              <p className="text-sm text-gray-600">{user?.email}</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                isStudent() 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
                                {user?.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                          </Link>
                          
                          {isStudent() && (
                            <>
                              <Link
                                to="/student"
                                className="flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                              </Link>
                              <Link
                                to="/orders"
                                className="flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Order History
                              </Link>
                              <Link
                                to="/restaurants"
                                className="flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                                </svg>
                                Browse Restaurants
                              </Link>
                            </>
                          )}
                          
                          {isRestaurantOwner() && (
                            <>
                              <Link
                                to="/restaurant/analytics"
                                className="flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analytics
                              </Link>
                              <Link
                                to="/restaurant/menu"
                                className="flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Manage Menu
                              </Link>
                            </>
                          )}
                        </div>

                        {/* Logout Button */}
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 min-h-[44px]"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
              </>
            )}
          </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-3 md:hidden">
              {/* Mobile Search Button */}
              {isAuthenticated && isStudent() && (
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-[#2D3748] hover:text-[#FF6B35] transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Mobile Cart Button */}
              {isAuthenticated && isStudent() && (
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative p-2 text-[#2D3748] hover:text-[#FF6B35] transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18" />
                  </svg>
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>
              )}

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-[#2D3748] hover:text-[#FF6B35] transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <div className="relative w-6 h-6 flex flex-col justify-center">
                  <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block w-6 h-0.5 bg-current mt-1 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block w-6 h-0.5 bg-current mt-1 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>
            </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16">
            <div className="bg-white w-full mx-4 mt-4 rounded-2xl shadow-2xl max-w-md">
              <div className="p-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-transparent rounded-full text-[#2D3748] placeholder-gray-500 focus:bg-white focus:border-[#FF6B35] focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
                
                {/* Mobile Search Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          navigate(`/restaurants?search=${encodeURIComponent(suggestion)}`);
                          setIsSearchOpen(false);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center space-x-3"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-[#2D3748]">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>

      {/* Modern Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#FF6B35]/5 to-[#F7931E]/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🍽️</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent">
                    FODYYY
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto">
                {!isAuthenticated ? (
                  <div className="p-4 space-y-4">
                    <Link
                      to="/"
                      className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                        isActivePath('/') 
                          ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                          : 'text-[#2D3748] hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center p-4 rounded-xl text-[#2D3748] hover:bg-gray-50 transition-colors min-h-[52px]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center p-4 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 min-h-[52px]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* User Info */}
                    <div className="p-4 border-b bg-gradient-to-r from-[#FF6B35]/5 to-[#F7931E]/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">
                            {getInitials(user?.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#2D3748]">{user?.name}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isStudent() 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {user?.role}
                            </span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-4 space-y-2">
                      {isStudent() && (
                        <>
                          <Link
                            to="/student"
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                              isActivePath('/student') 
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                                : 'text-[#2D3748] hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">Dashboard</span>
                          </Link>
                          <Link
                            to="/restaurants"
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                              isActivePath('/restaurants') 
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                                : 'text-[#2D3748] hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                            </svg>
                            <span className="font-medium">Restaurants</span>
                          </Link>
                          <Link
                            to="/orders"
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                              isActivePath('/orders') 
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                                : 'text-[#2D3748] hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="font-medium">My Orders</span>
                          </Link>
                        </>
                      )}

                      {isRestaurantOwner() && (
                        <>
                          <Link
                            to="/restaurant"
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                              isActivePath('/restaurant') 
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                                : 'text-[#2D3748] hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">Dashboard</span>
                          </Link>
                          <Link
                            to="/restaurant/orders"
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                              isActivePath('/restaurant/orders') 
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                                : 'text-[#2D3748] hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="font-medium">Orders</span>
                          </Link>
                          <Link
                            to="/restaurant/menu"
                            className={`flex items-center p-4 rounded-xl transition-all duration-300 min-h-[52px] ${
                              isActivePath('/restaurant/menu') 
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]' 
                                : 'text-[#2D3748] hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="font-medium">Menu</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center p-4 rounded-xl text-[#2D3748] hover:bg-gray-50 transition-colors min-h-[52px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Profile Settings</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors min-h-[52px]"
                      >
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide-out Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#FF6B35]/5 to-[#F7931E]/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2D3748]">Your Cart</h2>
                    <p className="text-sm text-gray-600">{getCartItemsCount()} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px]"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#2D3748] mb-2">Your cart feels lonely!</h3>
                    <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/restaurants');
                      }}
                      className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="space-y-4">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">🍽️</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-[#2D3748] text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#FF6B35]">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-[#2D3748]">Total:</span>
                        <span className="font-bold text-xl text-[#FF6B35]">
                          ₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/checkout');
                        }}
                        className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/cart');
                        }}
                        className="w-full mt-2 border-2 border-[#FF6B35] text-[#FF6B35] py-3 rounded-full font-semibold hover:bg-[#FF6B35] hover:text-white transition-all duration-300"
                      >
                        View Full Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Navbar;