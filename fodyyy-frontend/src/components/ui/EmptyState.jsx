import React from 'react';
import { motion } from 'framer-motion';
import GradientButton from './GradientButton';

/**
 * EmptyState - Reusable empty state component
 * 
 * @param {string} icon - Emoji or icon
 * @param {string} title - Main title
 * @param {string} description - Description text
 * @param {string} actionLabel - CTA button label
 * @param {function} onAction - CTA button handler
 */
const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  description = 'Get started by adding your first item',
  actionLabel = null,
  onAction = null,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-6xl mb-6 opacity-50"
      >
        {icon}
      </motion.div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <GradientButton onClick={onAction}>
          {actionLabel}
        </GradientButton>
      )}
    </motion.div>
  );
};

export default EmptyState;