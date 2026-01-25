'use client';

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const WishlistContext = createContext(null);

const initialState = {
  items: [],
  loading: false,
  error: null
};

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const fetchWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User not logged in, no wishlist
        dispatch({ type: 'SET_ITEMS', payload: [] });
        return;
      }

      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to add items to wishlist');
      }

      const res = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      dispatch({ type: 'SET_ITEMS', payload: data.items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error; // Re-throw so component can handle it
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to modify wishlist');
      }

      const res = await fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      dispatch({ type: 'SET_ITEMS', payload: data.items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to modify wishlist');
      }

      const res = await fetch('/api/wishlist/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      dispatch({ type: 'CLEAR_WISHLIST' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const moveToCart = useCallback(async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to move items to cart');
      }

      const res = await fetch('/api/wishlist/move-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      // Update both wishlist and cart states
      dispatch({ type: 'SET_ITEMS', payload: data.wishlist.items });
      
      // Dispatch custom event to notify cart to refresh
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { items: data.cart.items } 
      }));
      
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Helper function to check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return state.items.some(item => item.productId === productId);
  }, [state.items]);

  const value = {
    ...state,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
