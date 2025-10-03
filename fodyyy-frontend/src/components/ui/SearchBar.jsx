import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

/**
 * SearchBar - Reusable search bar with glassmorphism
 * 
 * @param {string} placeholder - Placeholder text
 * @param {function} onSearch - Search handler
 * @param {string} value - Controlled value
 * @param {function} onChange - Change handler
 * @param {array} suggestions - Search suggestions
 * @param {boolean} large - Large size variant
 */
const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  value = '',
  onChange,
  suggestions = [],
  large = false,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    if (onChange) onChange({ target: { value: suggestion } });
    if (onSearch) onSearch(suggestion);
    setShowSuggestions(false);
  };

  const sizeClasses = large 
    ? 'h-16 text-lg px-6' 
    : 'h-12 text-base px-4';

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <motion.div
          className="relative"
          animate={{ scale: isFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="text"
            value={value}
            onChange={onChange}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className={`w-full ${sizeClasses} pl-12 pr-4 bg-white/90 backdrop-blur-lg border-2 border-orange-200 rounded-full text-gray-900 placeholder-gray-500 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300 shadow-lg`}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-orange-500" />
          </div>
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-600 to-red-500 text-white p-2 rounded-full hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            <Search className="w-5 h-5" />
          </button>
        </motion.div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 py-2 z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors duration-200"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{suggestion}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;