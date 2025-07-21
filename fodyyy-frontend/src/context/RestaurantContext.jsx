import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import restaurantService from '../services/restaurantService';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresSetup, setRequiresSetup] = useState(false);

  const loadRestaurant = async () => {
    if (!user || user.role !== 'restaurant') {
      setRestaurant(null);
      setRequiresSetup(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await restaurantService.getMyRestaurant();
      
      if (response.success && response.data) {
        setRestaurant(response.data);
        setRequiresSetup(false);
      } else if (response.requiresSetup) {
        setRestaurant(null);
        setRequiresSetup(true);
      } else {
        setRestaurant(null);
        setRequiresSetup(false);
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      setRestaurant(null);
      setRequiresSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRestaurant = (updatedRestaurant) => {
    setRestaurant(updatedRestaurant);
    setRequiresSetup(false);
  };

  const refreshRestaurant = () => {
    loadRestaurant();
  };

  useEffect(() => {
    loadRestaurant();
  }, [user]);

  const value = {
    restaurant,
    restaurantId: restaurant?._id || null,
    isLoading,
    requiresSetup,
    updateRestaurant,
    refreshRestaurant,
    loadRestaurant
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantContext;