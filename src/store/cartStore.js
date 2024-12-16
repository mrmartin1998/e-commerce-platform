import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      fetchCart: async () => {
        try {
          set({ loading: true, error: null });
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.error) throw new Error(data.error);
          set({ items: data.items || [] });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      addToCart: async (productId, quantity = 1) => {
        try {
          set({ loading: true, error: null });
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Please login to add items to cart');

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
          set({ items: data.items });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          set({ loading: true, error: null });
          const token = localStorage.getItem('token');
          if (!token) return;

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
          set({ items: data.items });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (productId) => {
        try {
          set({ loading: true, error: null });
          const token = localStorage.getItem('token');
          if (!token) return;

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
          set({ items: data.items });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      clearCart: async () => {
        try {
          set({ loading: true, error: null });
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await fetch('/api/cart/clear', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.error) throw new Error(data.error);
          set({ items: [] });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'cart-storage'
    }
  )
); 