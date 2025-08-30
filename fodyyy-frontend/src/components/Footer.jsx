import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-orange-100 text-gray-600">
      {/* Minimal app footer for desktop/tablet. On mobile, BottomNavigation acts as the primary footer. */}
      <div className="max-w-7xl mx-auto px-4 py-6 hidden md:block">
        <div className="flex items-center justify-between">
          <p className="text-sm">© {currentYear} FODYYY</p>
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