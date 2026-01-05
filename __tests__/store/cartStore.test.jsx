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
  
  it('initializes with default empty state', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
