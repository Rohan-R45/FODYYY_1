import React from 'react';
import { motion } from 'framer-motion';

/**
 * FloatingFood - Animated floating food emoji for backgrounds
 * 
 * @param {string} emoji - Food emoji
 * @param {number} delay - Animation delay
 * @param {number} duration - Animation duration
 * @param {string} position - CSS position classes (e.g., 'top-10 left-20')
 */
const FloatingFood = ({ 
  emoji, 
  delay = 0, 
  duration = 3,
  position = '',
  size = 'text-4xl'
}) => {
  return (
    <motion.div
      className={`absolute ${position} ${size} opacity-20 pointer-events-none select-none`}
      initial={{ y: 0, rotate: 0, scale: 0.8 }}
      animate={{
        y: [-20, 20, -20],
        rotate: [-10, 10, -10],
        scale: [0.8, 1, 0.8]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
};

export default FloatingFood;