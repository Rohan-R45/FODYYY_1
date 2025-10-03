import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatsCard - Reusable statistics card with gradient background
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {React.ReactNode} icon - Icon element
 * @param {string} gradient - Gradient variant: 'orange' | 'green' | 'blue' | 'purple' | 'yellow'
 * @param {string} trend - Trend indicator: 'up' | 'down' | null
 * @param {string} trendValue - Trend percentage (e.g., '+12%')
 * @param {number} delay - Animation delay
 */
const StatsCard = ({
  title,
  value,
  icon,
  gradient = 'orange',
  trend = null,
  trendValue = '',
  delay = 0,
  className = ''
}) => {
  const gradients = {
    orange: 'from-orange-500 via-amber-500 to-yellow-400',
    green: 'from-green-500 via-emerald-500 to-teal-400',
    blue: 'from-blue-500 via-cyan-500 to-sky-400',
    purple: 'from-purple-500 via-violet-500 to-fuchsia-400',
    yellow: 'from-yellow-400 via-amber-400 to-orange-400',
    red: 'from-red-500 via-rose-500 to-pink-400'
  };

  const iconBgs = {
    orange: 'bg-orange-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100'
  };

  const iconColors = {
    orange: 'text-orange-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gradient-to-br ${gradients[gradient]} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/90 text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-3xl font-bold mb-1">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className="text-white/90 text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`${iconBgs[gradient]} rounded-2xl p-4 ${iconColors[gradient]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;