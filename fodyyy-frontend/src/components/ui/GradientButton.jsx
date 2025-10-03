import React from 'react';
import { motion } from 'framer-motion';

/**
 * GradientButton - Reusable gradient button component
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Full width button
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disabled state
 * @param {React.ReactNode} children - Button content
 * @param {React.ReactNode} icon - Icon element
 * @param {string} iconPosition - 'left' | 'right'
 */
const GradientButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  icon,
  iconPosition = 'right',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50',
    ghost: 'text-orange-600 hover:bg-orange-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const baseClasses = "rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
};

export default GradientButton;