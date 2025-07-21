import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload || []
      };

    case CART_ACTIONS.ADD_ITEM: {
      const { item, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(cartItem => cartItem._id === item._id);

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...state.items];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        if (newQuantity <= 0) {
          // Remove item if quantity becomes 0 or negative
          updatedItems.splice(existingItemIndex, 1);
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        
        return {
          ...state,
          items: updatedItems
        };
      } else if (quantity > 0) {
        // New item, add to cart
        return {
          ...state,
          items: [...state.items, { ...item, quantity }]
        };
      }
      
      return state;
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return {
          ...state,
          items: state.items.filter(item => item._id !== itemId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        )
      };
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload.itemId)
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Add item to cart
  const addToCart = (item, quantity = 1) => {
    // Check if adding item from different restaurant
    if (state.items.length > 0 && state.items[0].restaurantId !== item.restaurantId) {
      const confirmClear = window.confirm(
        'Your cart contains items from a different restaurant. Do you want to clear your cart and add this item?'
      );
      
      if (confirmClear) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        dispatch({ 
          type: CART_ACTIONS.ADD_ITEM, 
          payload: { item, quantity } 
        });
        toast.success(`${item.name} added to cart!`);
      }
      return;
    }

    dispatch({ 
      type: CART_ACTIONS.ADD_ITEM, 
      payload: { item, quantity } 
    });

   
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { itemId, quantity } 
    });

    if (quantity <= 0) {
      toast.success('Item removed from cart');
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const item = state.items.find(item => item._id === itemId);
    dispatch({ 
      type: CART_ACTIONS.REMOVE_ITEM, 
      payload: { itemId } 
    });
    
    if (item) {
      toast.success(`${item.name} removed from cart`);
    }
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Cart cleared');
  };

  // Get cart total
  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total items count
  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Get quantity of specific item
  const getCartItemQuantity = (itemId) => {
    const item = state.items.find(item => item._id === itemId);
    return item ? item.quantity : 0;
  };

  // Check if cart has items from specific restaurant
  const hasItemsFromRestaurant = (restaurantId) => {
    return state.items.some(item => item.restaurantId === restaurantId);
  };

  // Get restaurant info from cart
  const getCartRestaurant = () => {
    if (state.items.length > 0) {
      return {
        id: state.items[0].restaurantId,
        name: state.items[0].restaurantName
      };
    }
    return null;
  };

  const value = {
    cartItems: state.items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartItemQuantity,
    hasItemsFromRestaurant,
    getCartRestaurant
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;