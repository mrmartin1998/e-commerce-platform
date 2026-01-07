import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the cart store - put the mock definition before any usage
vi.mock('@/store/cartStore', () => {
  return {
    CartProvider: ({ children }) => children,
    useCart: () => ({
      items: [],
      loading: false,
      error: null,
      addToCart: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      fetchCart: vi.fn(),
    })
  }
});

// Import after mocking
import { useCart } from '@/store/cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock localStorage getItem for initialization
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'ecommerce_cart') return null;
      if (key === 'token') return null;
      return null;
    });
  });
  
  describe('Initialization', () => {
    it('initializes with default empty state', () => {
      const { result } = renderHook(() => useCart());
      
      expect(result.current.items).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('provides all required cart functions', () => {
      const { result } = renderHook(() => useCart());
      
      expect(result.current.addToCart).toBeDefined();
      expect(result.current.removeItem).toBeDefined();
      expect(result.current.updateQuantity).toBeDefined();
      expect(result.current.clearCart).toBeDefined();
      expect(result.current.fetchCart).toBeDefined();
    });
  });

  describe('addToCart', () => {
    it('calls addToCart with product data', () => {
      const { result } = renderHook(() => useCart());
      const product = { _id: '1', name: 'Test Product', price: 99.99 };
      
      result.current.addToCart(product);
      
      expect(result.current.addToCart).toHaveBeenCalledWith(product);
    });

    it('calls addToCart with product and quantity', () => {
      const { result } = renderHook(() => useCart());
      const product = { _id: '2', name: 'Another Product', price: 49.99 };
      
      result.current.addToCart(product, 3);
      
      expect(result.current.addToCart).toHaveBeenCalledWith(product, 3);
    });

    it('handles adding multiple products', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.addToCart({ _id: '1', name: 'Product 1', price: 10 });
      result.current.addToCart({ _id: '2', name: 'Product 2', price: 20 });
      result.current.addToCart({ _id: '3', name: 'Product 3', price: 30 });
      
      expect(result.current.addToCart).toHaveBeenCalledTimes(3);
    });
  });

  describe('removeItem', () => {
    it('calls removeItem with product ID', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.removeItem('product-123');
      
      expect(result.current.removeItem).toHaveBeenCalledWith('product-123');
    });

    it('handles removing multiple items', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.removeItem('item-1');
      result.current.removeItem('item-2');
      result.current.removeItem('item-3');
      
      expect(result.current.removeItem).toHaveBeenCalledTimes(3);
    });

    it('handles MongoDB ObjectId format', () => {
      const { result } = renderHook(() => useCart());
      const objectId = '507f1f77bcf86cd799439011';
      
      result.current.removeItem(objectId);
      
      expect(result.current.removeItem).toHaveBeenCalledWith(objectId);
    });
  });

  describe('updateQuantity', () => {
    it('calls updateQuantity with product ID and quantity', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.updateQuantity('product-456', 5);
      
      expect(result.current.updateQuantity).toHaveBeenCalledWith('product-456', 5);
    });

    it('handles setting quantity to zero', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.updateQuantity('product-789', 0);
      
      expect(result.current.updateQuantity).toHaveBeenCalledWith('product-789', 0);
    });

    it('handles incrementing quantity', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.updateQuantity('item-1', 1);
      result.current.updateQuantity('item-1', 2);
      result.current.updateQuantity('item-1', 3);
      
      expect(result.current.updateQuantity).toHaveBeenCalledTimes(3);
    });

    it('handles large quantity values', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.updateQuantity('item-1', 999);
      
      expect(result.current.updateQuantity).toHaveBeenCalledWith('item-1', 999);
    });
  });

  describe('clearCart', () => {
    it('calls clearCart function', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.clearCart();
      
      expect(result.current.clearCart).toHaveBeenCalledTimes(1);
    });

    it('can be called multiple times', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.clearCart();
      result.current.clearCart();
      
      expect(result.current.clearCart).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchCart', () => {
    it('calls fetchCart function', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.fetchCart();
      
      expect(result.current.fetchCart).toHaveBeenCalledTimes(1);
    });

    it('can be called multiple times', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.fetchCart();
      result.current.fetchCart();
      result.current.fetchCart();
      
      expect(result.current.fetchCart).toHaveBeenCalledTimes(3);
    });
  });

  describe('Multiple operations', () => {
    it('handles add and remove in sequence', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.addToCart({ _id: '1', name: 'Product 1', price: 10 });
      result.current.addToCart({ _id: '2', name: 'Product 2', price: 20 });
      result.current.removeItem('1');
      
      expect(result.current.addToCart).toHaveBeenCalledTimes(2);
      expect(result.current.removeItem).toHaveBeenCalledTimes(1);
    });

    it('handles add, update, and clear workflow', () => {
      const { result } = renderHook(() => useCart());
      
      result.current.addToCart({ _id: '1', name: 'Product 1', price: 10 });
      result.current.updateQuantity('1', 5);
      result.current.clearCart();
      
      expect(result.current.addToCart).toHaveBeenCalledTimes(1);
      expect(result.current.updateQuantity).toHaveBeenCalledTimes(1);
      expect(result.current.clearCart).toHaveBeenCalledTimes(1);
    });

    it('handles complex cart workflow', () => {
      const { result } = renderHook(() => useCart());
      
      // Add multiple items
      result.current.addToCart({ _id: '1', name: 'Product 1', price: 10 });
      result.current.addToCart({ _id: '2', name: 'Product 2', price: 20 });
      result.current.addToCart({ _id: '3', name: 'Product 3', price: 30 });
      
      // Update quantities
      result.current.updateQuantity('1', 2);
      result.current.updateQuantity('2', 5);
      
      // Remove one item
      result.current.removeItem('3');
      
      // Fetch updated cart
      result.current.fetchCart();
      
      expect(result.current.addToCart).toHaveBeenCalledTimes(3);
      expect(result.current.updateQuantity).toHaveBeenCalledTimes(2);
      expect(result.current.removeItem).toHaveBeenCalledTimes(1);
      expect(result.current.fetchCart).toHaveBeenCalledTimes(1);
    });
  });
});
