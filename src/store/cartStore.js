'use client';

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],
  loading: false,
  error: null
};

// localStorage utilities
const CART_STORAGE_KEY = 'ecommerce_cart';

const getStoredCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

const storeCart = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error storing cart to localStorage:', error);
  }
};

const clearStoredCart = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
  }
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const storedItems = getStoredCart();
    if (storedItems.length > 0) {
      dispatch({ type: 'SET_ITEMS', payload: storedItems });
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    storeCart(state.items);
  }, [state.items]);

  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      if (!token) {
        // User not logged in, keep localStorage cart
        return;
      }

      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      // Set server cart items
      dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Sync localStorage cart with server (Option A: add quantities)
  const syncCartWithServer = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const localItems = getStoredCart();
      if (localItems.length === 0) return;

      dispatch({ type: 'SET_LOADING', payload: true });

      // Add each local item to server cart (quantities will be added)
      for (const localItem of localItems) {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            productId: localItem.productId, 
            quantity: localItem.quantity 
          })
        });
      }

      // Clear localStorage after successful sync
      clearStoredCart();

      // Fetch updated cart from server
      await fetchCart();
    } catch (error) {
      console.error('Error syncing cart with server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User not logged in, add to localStorage cart
        const currentItems = [...state.items];
        const existingItem = currentItems.find(item => item.productId === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          // Fetch product details for localStorage cart
          try {
            const productRes = await fetch(`/api/products/${productId}`);
            const productData = await productRes.json();
            
            if (productData.product) {
              currentItems.push({
                productId,
                quantity,
                price: productData.product.price,
                name: productData.product.name,
                image: productData.product.images?.[0]?.url || '/images/placeholder.png' // Fix: Use proper fallback
              });
            }
          } catch (err) {
            console.error('Error fetching product details:', err);
            // Add item anyway with basic info
            currentItems.push({
              productId,
              quantity,
              price: 0,
              name: 'Product',
              image: '/images/placeholder.png' // Fix: Use proper fallback
            });
          }
        }
        
        dispatch({ type: 'SET_ITEMS', payload: currentItems });
        return;
      }

      // User logged in, add to server cart
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      dispatch({ type: 'SET_ITEMS', payload: data.items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.items]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User not logged in, update localStorage cart
        const currentItems = state.items.map(item => 
          item.productId === productId 
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0);
        
        dispatch({ type: 'SET_ITEMS', payload: currentItems });
        return;
      }

      // User logged in, update server cart
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      dispatch({ type: 'SET_ITEMS', payload: data.items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.items]);

  const removeItem = useCallback(async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User not logged in, remove from localStorage cart
        const currentItems = state.items.filter(item => item.productId !== productId);
        dispatch({ type: 'SET_ITEMS', payload: currentItems });
        return;
      }

      // User logged in, remove from server cart
      const res = await fetch('/api/cart/remove', {
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
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.items]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    clearStoredCart();
  }, []);

  const value = {
    ...state,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    syncCartWithServer // Export for use in login
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}