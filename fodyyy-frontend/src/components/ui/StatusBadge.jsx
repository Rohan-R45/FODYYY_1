import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatusBadge - Reusable status badge component
 * 
 * @param {string} status - Order status
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} animated - Enable pulse animation
 */
const StatusBadge = ({ status, size = 'md', animated = false, className = '' }) => {
  const statusConfig = {
    pending: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      border: 'border-yellow-200',
      icon: '⏳',
      label: 'Pending'
    },
    confirmed: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      border: 'border-blue-200',
      icon: '✅',
      label: 'Confirmed'
    },
    preparing: { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800', 
      border: 'border-orange-200',
      icon: '👨‍🍳',
      label: 'Preparing'
    },
    ready: { 
      bg: 'bg-purple-100', 
      text: 'text-purple-800', 
      border: 'border-purple-200',
      icon: '🎉',
      label: 'Ready'
    },
    out_for_delivery: { 
      bg: 'bg-indigo-100', 
      text: 'text-indigo-800', 
      border: 'border-indigo-200',
      icon: '🚚',
      label: 'Out for Delivery'
    },
    delivered: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-200',
      icon: '✅',
      label: 'Delivered'
    },
    cancelled: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      border: 'border-red-200',
      icon: '❌',
      label: 'Cancelled'
    }
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  const BadgeContent = () => (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.text} ${config.border} ${sizes[size]} ${className}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <BadgeContent />
      </motion.div>
    );
  }

  return <BadgeContent />;
};

export default StatusBadge;