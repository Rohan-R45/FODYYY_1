import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, onSubmit, orderNumber, restaurantName, isLoading }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    // Show loading state
    const result = await onSubmit({
      rating: selectedRating,
      comment
    });

    if (result?.success) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedRating(0);
        setComment('');
        onClose();
      }, 2000);
    }
  };

  const handleSkip = () => {
    setSelectedRating(0);
    setComment('');
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.75, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    exit: { opacity: 0, scale: 0.75, y: 20 }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleSkip}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                // Success State
                <motion.div
                  key="success"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold text-gray-800"
                  >
                    Thank you! 🎉
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-600 mt-2"
                  >
                    Your rating has been submitted successfully
                  </motion.p>
                </motion.div>
              ) : (
                // Form State
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center">How was your order?</h2>
                    <p className="text-sm text-gray-600 text-center mt-2">
                      Help us improve • {restaurantName}
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-4 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none transition-transform"
                      >
                        <Star
                          className={`w-16 h-16 transition-all duration-200 ${
                            star <= (hoveredRating || selectedRating)
                              ? 'fill-[#FFC857] text-[#FFC857]'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Rating Description */}
                  {selectedRating > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-6"
                    >
                      <p className="text-sm font-medium text-gray-700">
                        {selectedRating === 1 && "Needs improvement 😞"}
                        {selectedRating === 2 && "Could be better 😐"}
                        {selectedRating === 3 && "Average experience 😊"}
                        {selectedRating === 4 && "Really enjoyed it! 😍"}
                        {selectedRating === 5 && "Absolutely love it! 🤩"}
                      </p>
                    </motion.div>
                  )}

                  {/* Comment Box */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Share your feedback (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value.slice(0, 500))}
                      placeholder="Tell us what you think..."
                      maxLength={500}
                      className="w-full min-h-20 p-4 rounded-xl border-2 border-gray-200 focus:border-[#FF6B35] focus:outline-none resize-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {comment.length}/500
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={selectedRating === 0 || isLoading}
                      className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                        selectedRating === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#FF6B35] to-[#FF9F1C] hover:shadow-lg'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Rating'
                      )}
                    </motion.button>

                    <button
                      onClick={handleSkip}
                      disabled={isLoading}
                      className="w-full py-3 text-gray-600 font-semibold hover:text-gray-800 transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RatingModal;