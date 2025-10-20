import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Check } from 'lucide-react';

const RatingDisplay = ({ 
  rating = 0, 
  totalReviews = 0, 
  showCount = true, 
  size = 'md',
  animated = false,
  previousRating = null
}) => {
  const [displayRating, setDisplayRating] = useState(rating);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const prevRatingRef = useRef(rating);

  // Handle rating updates with animation
  useEffect(() => {
    // Determine what the "previous" rating was
    const actualPreviousRating = previousRating !== null ? previousRating : prevRatingRef.current;
    const hasChanged = rating !== actualPreviousRating;
    
    if (animated && hasChanged) {
      // Show checkmark on update
      setShowCheckmark(true);
      setTimeout(() => setShowCheckmark(false), 2000);
      
      // Animate the rating change
      const duration = 600;
      const startTime = Date.now();
      const diff = rating - actualPreviousRating;
      
      const animateRating = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newValue = actualPreviousRating + (diff * progress);
        setDisplayRating(Math.round(newValue * 10) / 10);
        
        if (progress < 1) {
          requestAnimationFrame(animateRating);
        }
      };
      
      animateRating();
    } else {
      setDisplayRating(rating);
    }
    
    // Update ref for next comparison
    prevRatingRef.current = rating;
  }, [rating, previousRating, animated]);

  const sizeClasses = {
    sm: {
      star: 'w-4 h-4',
      text: 'text-sm'
    },
    md: {
      star: 'w-5 h-5',
      text: 'text-base'
    },
    lg: {
      star: 'w-6 h-6',
      text: 'text-lg'
    },
    xl: {
      star: 'w-8 h-8',
      text: 'text-xl'
    }
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center gap-1">
        {/* Star Icon */}
        <motion.div
          animate={showCheckmark ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Star className={`${sizeConfig.star} fill-[#FFC857] text-[#FFC857]`} />
        </motion.div>

        {/* Checkmark on update */}
        {showCheckmark && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute"
          >
            <div className="relative">
              <Check className={`${sizeConfig.star} text-green-500 fill-green-500`} />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
              >
                Updated!
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rating Value */}
      <motion.div
        key={`${displayRating}-${totalReviews}`}
        initial={animated && previousRating !== null ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`font-semibold text-gray-800 ${sizeConfig.text}`}
      >
        {displayRating.toFixed(1)}
      </motion.div>

      {/* Review Count */}
      {showCount && totalReviews > 0 && (
        <motion.span
          initial={animated && previousRating !== null ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-gray-500 text-sm"
        >
          ({totalReviews}+)
        </motion.span>
      )}
    </div>
  );
};

export default RatingDisplay;