import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1 - About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                IIT & IISER Tirupati Food Hub
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting IIT & IISER Tirupati students with local restaurants for convenient food ordering. 
              Experience seamless dining with our dedicated platform built for the IIT & IISER Tirupati communities.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24/7 Online Ordering</span>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-orange-400 border-b border-orange-400/30 pb-2">
              Quick Links
            </h4>
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🏠 Home
              </Link>
              <Link 
                to="/restaurants" 
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🍽️ Browse Restaurants
              </Link>
              <Link 
                to="/how-it-works" 
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                ❓ How It Works
              </Link>
              <Link 
                to="/contact" 
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                📞 Contact Us
              </Link>
              <Link 
                to="/privacy" 
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🔒 Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                📋 Terms of Service
              </Link>
            </nav>
          </div>

          {/* Column 3 - For Students */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400 border-b border-blue-400/30 pb-2">
              For Students
            </h4>
            <nav className="space-y-2">
              <Link 
                to="/login" 
                className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🎓 Student Login
              </Link>
              <Link 
                to="/register" 
                className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                📝 Register as Student
              </Link>
              <Link 
                to="/orders" 
                className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                📦 Order Tracking
              </Link>
              <Link 
                to="/support" 
                className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🆘 Help & Support
              </Link>
              <Link 
                to="/faq" 
                className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                💡 FAQs
              </Link>
            </nav>
          </div>

          {/* Column 4 - For Restaurants */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
              For Restaurants
            </h4>
            <nav className="space-y-2">
              <Link 
                to="/restaurant/login" 
                className="block text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🏪 Restaurant Login
              </Link>
              <Link 
                to="/restaurant/register" 
                className="block text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                📋 Register Your Restaurant
              </Link>
              <Link 
                to="/partner" 
                className="block text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                🤝 Partner with Us
              </Link>
              <Link 
                to="/restaurant/guidelines" 
                className="block text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm hover:translate-x-1 transform"
              >
                📖 Restaurant Guidelines
              </Link>
            </nav>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Email */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                <a 
                  href="mailto:fodyyy1@gmail.com" 
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  fodyyy1@gmail.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                <a 
                  href="tel:+91-9989671246" 
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors"
                >
                  +91-9989671246
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Address</p>
                <p className="text-sm text-gray-300">
                  IIT & IISER Tirupati, Tirupati<br />
                  Andhra Pradesh
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Hours</p>
                <p className="text-sm text-gray-300">24/7 Online Ordering</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-400 mr-4">Follow us:</p>
              
              {/* Instagram */}
              <a 
                href="https://instagram.com/iittfoodhub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transform transition-all duration-200 hover:shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/iittfoodhub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transform transition-all duration-200 hover:shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Twitter */}
              <a 
                href="https://twitter.com/iittfoodhub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:scale-110 transform transition-all duration-200 hover:shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>

            {/* IIT & IISER Tirupati Badge */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-orange-600/20 px-4 py-2 rounded-full border border-blue-500/30">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300">
                Official IIT & IISER Tirupati Platform
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-black/30 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {currentYear} IIT & IISER Tirupati Food Hub. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Made with ❤️ for IIT & IISER Tirupati Students
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Powered by React</span>
              <span>•</span>
              <span>Secured with SSL</span>
              <span>•</span>
              <span>Mobile Optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"></div>
    </footer>
  );
};

export default Footer;