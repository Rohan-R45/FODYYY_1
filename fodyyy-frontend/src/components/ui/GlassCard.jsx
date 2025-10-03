import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard - Reusable glassmorphism card component
 * 
 * @param {string} className - Additional Tailwind classes
 * @param {React.ReactNode} children - Card content
 * @param {boolean} hover - Enable hover lift effect (default: true)
 * @param {boolean} animate - Enable entrance animation (default: true)
 * @param {number} delay - Animation delay in seconds (default: 0)
 * @param {function} onClick - Click handler
 */
const GlassCard = ({ 
  className = '', 
  children, 
  hover = true,
  animate = true,
  delay = 0,
  onClick,
  ...props 
}) => {
  const baseClasses = "bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-100 transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-xl hover:scale-[1.02] hover:border-orange-200" : "";
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay }
  } : {};

  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      {...animationProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;