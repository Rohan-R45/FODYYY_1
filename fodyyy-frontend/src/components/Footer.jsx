import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-orange-100 text-gray-600">
      {/* Responsive footer visible on all devices. On mobile, it appears above the bottom nav. */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 mobile-safe-area">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm">© {currentYear} FOODY</p>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
            <Link to="/contact" className="hover:text-gray-900">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;