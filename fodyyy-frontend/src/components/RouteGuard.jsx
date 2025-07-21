import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateRouteParams, isValidId } from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';

/**
 * Generic Route Guard Component
 * Validates route parameters before rendering children
 */
const RouteGuard = ({ 
  children, 
  requiredParams = [], 
  fallbackPath = '/',
  loadingComponent = null,
  errorComponent = null 
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [validationState, setValidationState] = useState({
    isValidating: true,
    isValid: false,
    errors: []
  });

  useEffect(() => {
    const validateParams = () => {
      const validation = validateRouteParams(params, requiredParams);
      
      setValidationState({
        isValidating: false,
        isValid: validation.isValid,
        errors: validation.errors
      });

      // Redirect if validation fails
      if (!validation.isValid) {
        console.warn('Route validation failed:', validation.errors);
        setTimeout(() => {
          navigate(fallbackPath, { replace: true });
        }, 2000); // Give user time to see error message
      }
    };

    validateParams();
  }, [params, requiredParams, navigate, fallbackPath]);

  // Show loading state
  if (validationState.isValidating) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (!validationState.isValid) {
    return errorComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Route</h2>
          <div className="text-gray-600 mb-6">
            {validationState.errors.map((error, index) => (
              <p key={index} className="mb-1">{error}</p>
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-4">Redirecting you back...</p>
          <button 
            onClick={() => navigate(fallbackPath)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Now
          </button>
        </div>
      </div>
    );
  }

  // Render children if validation passes
  return children;
};

/**
 * Restaurant Route Guard
 * Specifically for restaurant-related routes
 */
export const RestaurantRouteGuard = ({ children, fallbackPath = '/restaurants' }) => {
  return (
    <RouteGuard
      requiredParams={['id']}
      fallbackPath={fallbackPath}
      errorComponent={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h2>
            <p className="text-gray-600 mb-6">
              The restaurant you're looking for doesn't exist or the link is invalid.
            </p>
            <p className="text-sm text-gray-500 mb-4">Redirecting to restaurants list...</p>
            <button 
              onClick={() => window.location.href = '/restaurants'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      }
    >
      {children}
    </RouteGuard>
  );
};

/**
 * Order Route Guard
 * Specifically for order-related routes
 */
export const OrderRouteGuard = ({ children, fallbackPath = '/orders' }) => {
  return (
    <RouteGuard
      requiredParams={['id']}
      fallbackPath={fallbackPath}
      errorComponent={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.175.193-.39.398-.774.618-1.15A8.962 8.962 0 0112 13.5c2.34 0 4.5-.816 6.207-2.175-.193-.39-.398-.774-.618-1.15A7.962 7.962 0 0112 12z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Order ID</h2>
            <p className="text-gray-600 mb-6">
              The order ID format is invalid or the order doesn't exist.
            </p>
            <p className="text-sm text-gray-500 mb-4">Redirecting to orders list...</p>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      }
    >
      {children}
    </RouteGuard>
  );
};

export default RouteGuard;