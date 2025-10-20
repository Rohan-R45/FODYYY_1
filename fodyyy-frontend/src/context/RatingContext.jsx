import React, { createContext, useContext, useCallback, useState, useRef } from 'react';

const RatingContext = createContext();

export const useRatingUpdates = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRatingUpdates must be used within RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }) => {
  const [ratingUpdates, setRatingUpdates] = useState({});
  const subscribersRef = useRef({});

  // Subscribe to rating updates for a specific restaurant
  const subscribeToRestaurant = useCallback((restaurantId, callback) => {
    if (!subscribersRef.current[restaurantId]) {
      subscribersRef.current[restaurantId] = [];
    }
    subscribersRef.current[restaurantId].push(callback);

    // Return unsubscribe function
    return () => {
      subscribersRef.current[restaurantId] = subscribersRef.current[restaurantId].filter(
        cb => cb !== callback
      );
    };
  }, []);

  // Broadcast rating update to all subscribers for a restaurant
  const updateRestaurantRating = useCallback((restaurantId, newRating, totalReviews) => {
    // Store the update
    setRatingUpdates(prev => ({
      ...prev,
      [restaurantId]: { rating: newRating, totalReviews, timestamp: Date.now() }
    }));

    // Notify all subscribers
    if (subscribersRef.current[restaurantId]) {
      subscribersRef.current[restaurantId].forEach(callback => {
        callback({ rating: newRating, totalReviews });
      });
    }
  }, []);

  // Get the latest rating update for a restaurant
  const getLatestRating = useCallback((restaurantId) => {
    return ratingUpdates[restaurantId] || null;
  }, [ratingUpdates]);

  // Clear updates (optional for cleanup)
  const clearUpdates = useCallback(() => {
    setRatingUpdates({});
  }, []);

  const value = {
    subscribeToRestaurant,
    updateRestaurantRating,
    getLatestRating,
    clearUpdates,
    ratingUpdates
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};

export default RatingContext;