import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// EXPLANATION: What are we testing?
// ============================================================================
// This file tests the /api/products route which handles:
// 1. Searching products by keyword (name, description, category)
// 2. Filtering by category
// 3. Filtering by price range (minPrice, maxPrice)
// 4. Sorting products (by price, name, date)
// 5. Pagination (showing 12 products per page)
// 
// We use MOCKS to avoid needing a real database - we fake the responses!

// ============================================================================
// STEP 1: Mock Next.js (we don't need the real Next.js for testing)
// ============================================================================
vi.mock('next/server', () => ({
  NextResponse: {
    // When route calls NextResponse.json(), we return a fake response
    json: vi.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: options?.status ? options.status < 400 : true
    }))
  }
}));

// ============================================================================
// STEP 2: Mock database connection (no real database needed)
// ============================================================================
vi.mock('@/lib/db/mongoose', () => ({
  default: vi.fn().mockResolvedValue(true) // Fake "connected to database"
}));

// ============================================================================
// STEP 3: Mock the Product model (fake database queries)
// ============================================================================
// EXPLANATION: Create mock functions that we can control in our tests
vi.mock('@/lib/models', () => ({
  Product: {
    aggregate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}));

// ============================================================================
// STEP 4: Mock authentication (fake user login)
// ============================================================================
vi.mock('@/lib/middleware/auth', () => ({
  verifyAuth: vi.fn()
}));

vi.mock('@/lib/middleware/adminAuth', () => ({
  requireAdmin: vi.fn((handler) => handler) // Just return the handler function
}));

// Import AFTER mocks are set up
import { GET } from '@/app/api/products/route';
import { Product } from '@/lib/models';
import { verifyAuth } from '@/lib/middleware/auth';

// ============================================================================
// HELPER FUNCTION: Create fake HTTP requests
// ============================================================================
// This simulates what happens when a user visits a URL with query parameters
const createRequest = (params = {}) => {
  const url = new URL('http://localhost:3000/api/products');
  
  // Add all the query parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return {
    url: url.toString(),
    method: 'GET'
  };
};

// ============================================================================
// TESTS START HERE!
// ============================================================================
describe('Product Search and Filter API', () => {
  
  // Before each test, reset all mocks to start fresh
  beforeEach(() => {
    vi.clearAllMocks();
    // By default, user is not an admin
    verifyAuth.mockResolvedValue({ isAdmin: false, role: 'user' });
  });

  // ==========================================================================
  // TEST SUITE 1: Basic Product Fetching
  // ==========================================================================
  describe('GET /api/products - Basic Fetching', () => {
    
    it('should return all published products with pagination', async () => {
      // EXPLANATION: This tests the most basic case - just get products
      
      // 1. Create fake products that the database would return
      const mockProducts = [
        { _id: '1', name: 'Laptop', price: 999, category: 'Electronics', status: 'published' },
        { _id: '2', name: 'Mouse', price: 25, category: 'Electronics', status: 'published' }
      ];
      
      // 2. Tell the mock aggregate function what to return
      Product.aggregate.mockResolvedValue([{
        products: mockProducts,
        totalCount: [{ count: 2 }]
      }]);
      
      // 3. Create a fake HTTP request (no filters, just get products)
      const request = createRequest();
      
      // 4. Call the actual GET function
      const response = await GET(request);
      const data = await response.json();
      
      // 5. Check that it worked correctly
      expect(data.products).toHaveLength(2);
      expect(data.products[0].name).toBe('Laptop');
      expect(data.pagination.current).toBe(1);
      expect(data.pagination.totalProducts).toBe(2);
    });

    it('should only show published products to non-admin users', async () => {
      // EXPLANATION: Regular users shouldn't see draft products
      
      // Mock aggregate checks that status: 'published' is in the query
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Verify the query includes status: published
        expect(matchStage.$match.status).toBe('published');
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest();
      await GET(request);
      
      // The mock implementation above already checked the query
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should show all products to admin users', async () => {
      // EXPLANATION: Admins can see draft AND published products
      
      // Make the user an admin
      verifyAuth.mockResolvedValue({ isAdmin: true, role: 'admin' });
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Admin query should NOT filter by status
        expect(matchStage.$match.status).toBeUndefined();
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest();
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TEST SUITE 2: Search Functionality
  // ==========================================================================
  describe('GET /api/products - Search', () => {
    
    it('should search products by name', async () => {
      // EXPLANATION: When user types "laptop", find products with "laptop" in name
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Check that the search query is set up correctly
        expect(matchStage.$match.$or).toBeDefined();
        expect(matchStage.$match.$or[0].name.$regex).toBe('laptop');
        expect(matchStage.$match.$or[0].name.$options).toBe('i'); // 'i' = case-insensitive
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ q: 'laptop' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should search products by description', async () => {
      // EXPLANATION: Search should also look in product descriptions
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Should search in name, description, AND category
        expect(matchStage.$match.$or).toHaveLength(3);
        expect(matchStage.$match.$or[1].description.$regex).toBe('portable');
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ q: 'portable' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should return matching products from search', async () => {
      // EXPLANATION: Test that search actually returns the right products
      
      const searchResults = [
        { _id: '1', name: 'Gaming Laptop', price: 1299, category: 'Electronics' }
      ];
      
      Product.aggregate.mockResolvedValue([{
        products: searchResults,
        totalCount: [{ count: 1 }]
      }]);
      
      const request = createRequest({ q: 'laptop' });
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.products).toHaveLength(1);
      expect(data.products[0].name).toBe('Gaming Laptop');
    });
  });

  // ==========================================================================
  // TEST SUITE 3: Category Filtering
  // ==========================================================================
  describe('GET /api/products - Category Filter', () => {
    
    it('should filter products by category', async () => {
      // EXPLANATION: Show only products from selected category
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Check category filter is applied
        expect(matchStage.$match.category).toBe('Electronics');
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ category: 'Electronics' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should return only products from selected category', async () => {
      // EXPLANATION: Verify filtered results are correct
      
      const electronics = [
        { _id: '1', name: 'Laptop', category: 'Electronics', price: 999 },
        { _id: '2', name: 'Phone', category: 'Electronics', price: 699 }
      ];
      
      Product.aggregate.mockResolvedValue([{
        products: electronics,
        totalCount: [{ count: 2 }]
      }]);
      
      const request = createRequest({ category: 'Electronics' });
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.products).toHaveLength(2);
      expect(data.products.every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should combine search and category filter', async () => {
      // EXPLANATION: User can search + filter by category at same time
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Should have BOTH search query AND category filter
        expect(matchStage.$match.$or).toBeDefined(); // Search
        expect(matchStage.$match.category).toBe('Electronics'); // Category
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ q: 'laptop', category: 'Electronics' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TEST SUITE 4: Price Range Filtering
  // ==========================================================================
  describe('GET /api/products - Price Filter', () => {
    
    it('should filter by minimum price', async () => {
      // EXPLANATION: Show products >= $100
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Check minimum price filter
        expect(matchStage.$match.price.$gte).toBe(100);
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ minPrice: '100' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should filter by maximum price', async () => {
      // EXPLANATION: Show products <= $500
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Check maximum price filter
        expect(matchStage.$match.price.$lte).toBe(500);
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ maxPrice: '500' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should filter by price range (min and max)', async () => {
      // EXPLANATION: Show products between $100 and $500
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        // Should have BOTH min and max
        expect(matchStage.$match.price.$gte).toBe(100);
        expect(matchStage.$match.price.$lte).toBe(500);
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ minPrice: '100', maxPrice: '500' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should return products within price range', async () => {
      // EXPLANATION: Verify price-filtered results
      
      const affordableProducts = [
        { _id: '1', name: 'Mouse', price: 25 },
        { _id: '2', name: 'Keyboard', price: 45 }
      ];
      
      Product.aggregate.mockResolvedValue([{
        products: affordableProducts,
        totalCount: [{ count: 2 }]
      }]);
      
      const request = createRequest({ minPrice: '20', maxPrice: '50' });
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.products).toHaveLength(2);
      expect(data.products[0].price).toBe(25);
      expect(data.products[1].price).toBe(45);
    });
  });

  // ==========================================================================
  // TEST SUITE 5: Sorting
  // ==========================================================================
  describe('GET /api/products - Sorting', () => {
    
    it('should sort by price ascending', async () => {
      // EXPLANATION: Sort cheapest first
      
      Product.aggregate.mockImplementation((pipeline) => {
        const sortStage = pipeline[1].$facet.products.find(stage => stage.$sort);
        // Check sort is price ascending (1 = ascending)
        expect(sortStage.$sort.price).toBe(1);
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ sortBy: 'price', sortOrder: 'asc' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should sort by price descending', async () => {
      // EXPLANATION: Sort most expensive first
      
      Product.aggregate.mockImplementation((pipeline) => {
        const sortStage = pipeline[1].$facet.products.find(stage => stage.$sort);
        // Check sort is price descending (-1 = descending)
        expect(sortStage.$sort.price).toBe(-1);
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ sortBy: 'price', sortOrder: 'desc' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should sort by name alphabetically', async () => {
      // EXPLANATION: Sort A-Z by product name
      
      Product.aggregate.mockImplementation((pipeline) => {
        const sortStage = pipeline[1].$facet.products.find(stage => stage.$sort);
        expect(sortStage.$sort.name).toBe(1); // 1 = A to Z
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({ sortBy: 'name', sortOrder: 'asc' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should default sort by createdAt descending', async () => {
      // EXPLANATION: By default, show newest products first
      
      Product.aggregate.mockImplementation((pipeline) => {
        const sortStage = pipeline[1].$facet.products.find(stage => stage.$sort);
        // Default is newest first
        expect(sortStage.$sort.createdAt).toBe(-1);
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest(); // No sort params = use default
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // TEST SUITE 6: Pagination
  // ==========================================================================
  describe('GET /api/products - Pagination', () => {
    
    it('should paginate results (12 products per page)', async () => {
      // EXPLANATION: Don't show all 1000 products at once!
      
      Product.aggregate.mockImplementation((pipeline) => {
        const limitStage = pipeline[1].$facet.products.find(stage => stage.$limit);
        // Should limit to 12 products
        expect(limitStage.$limit).toBe(12);
        return Promise.resolve([{ products: [], totalCount: [{ count: 50 }] }]);
      });
      
      const request = createRequest({ page: '1' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should calculate correct page offset', async () => {
      // EXPLANATION: Page 2 should skip first 12 products
      
      Product.aggregate.mockImplementation((pipeline) => {
        const skipStage = pipeline[1].$facet.products.find(stage => stage.$skip);
        // Page 2 = skip 12 products (page 1)
        expect(skipStage.$skip).toBe(12);
        return Promise.resolve([{ products: [], totalCount: [{ count: 50 }] }]);
      });
      
      const request = createRequest({ page: '2' });
      await GET(request);
      
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should return pagination metadata', async () => {
      // EXPLANATION: Tell user what page they're on and how many total pages
      
      Product.aggregate.mockResolvedValue([{
        products: Array(12).fill({ name: 'Product' }),
        totalCount: [{ count: 50 }] // 50 total products
      }]);
      
      const request = createRequest({ page: '2' });
      const response = await GET(request);
      const data = await response.json();
      
      // 50 products / 12 per page = 5 pages total
      expect(data.pagination.current).toBe(2);
      expect(data.pagination.total).toBe(5); // Math.ceil(50/12) = 5
      expect(data.pagination.hasMore).toBe(true); // Page 2 of 5, so more pages exist
      expect(data.pagination.totalProducts).toBe(50);
    });

    it('should indicate when on last page', async () => {
      // EXPLANATION: Let user know there are no more pages
      
      Product.aggregate.mockResolvedValue([{
        products: Array(2).fill({ name: 'Product' }), // Only 2 products on last page
        totalCount: [{ count: 50 }]
      }]);
      
      const request = createRequest({ page: '5' }); // Last page
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.pagination.hasMore).toBe(false); // No more pages
    });
  });

  // ==========================================================================
  // TEST SUITE 7: Complex Combined Filters
  // ==========================================================================
  describe('GET /api/products - Combined Filters', () => {
    
    it('should handle all filters together', async () => {
      // EXPLANATION: Search + Category + Price + Sort all at once
      
      Product.aggregate.mockImplementation((pipeline) => {
        const matchStage = pipeline.find(stage => stage.$match);
        const sortStage = pipeline[1].$facet.products.find(stage => stage.$sort);
        
        // Check ALL filters are applied
        expect(matchStage.$match.$or).toBeDefined(); // Search
        expect(matchStage.$match.category).toBe('Electronics'); // Category
        expect(matchStage.$match.price.$gte).toBe(100); // Min price
        expect(matchStage.$match.price.$lte).toBe(1000); // Max price
        expect(sortStage.$sort.price).toBe(1); // Sort by price asc
        
        return Promise.resolve([{ products: [], totalCount: [{ count: 0 }] }]);
      });
      
      const request = createRequest({
        q: 'laptop',
        category: 'Electronics',
        minPrice: '100',
        maxPrice: '1000',
        sortBy: 'price',
        sortOrder: 'asc',
        page: '1'
      });
      
      await GET(request);
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it('should return correctly filtered and sorted results', async () => {
      // EXPLANATION: Real-world scenario - search for affordable electronics
      
      const results = [
        { _id: '1', name: 'Budget Laptop', price: 299, category: 'Electronics' },
        { _id: '2', name: 'Student Laptop', price: 399, category: 'Electronics' }
      ];
      
      Product.aggregate.mockResolvedValue([{
        products: results,
        totalCount: [{ count: 2 }]
      }]);
      
      const request = createRequest({
        q: 'laptop',
        category: 'Electronics',
        maxPrice: '500'
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.products).toHaveLength(2);
      expect(data.products[0].name).toBe('Budget Laptop');
      expect(data.products[0].price).toBeLessThanOrEqual(500);
    });
  });

  // ==========================================================================
  // TEST SUITE 8: Error Handling
  // ==========================================================================
  describe('GET /api/products - Error Handling', () => {
    
    it('should handle database errors gracefully', async () => {
      // EXPLANATION: If database fails, return error message
      
      Product.aggregate.mockRejectedValue(new Error('Database connection failed'));
      
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch products');
    });

    it('should handle empty results', async () => {
      // EXPLANATION: No products found - return empty array
      
      Product.aggregate.mockResolvedValue([{
        products: [],
        totalCount: []
      }]);
      
      const request = createRequest({ q: 'nonexistent' });
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.products).toHaveLength(0);
      expect(data.pagination.totalProducts).toBe(0);
    });

    it('should handle invalid page numbers', async () => {
      // EXPLANATION: Page "abc" should default to page 1
      
      Product.aggregate.mockResolvedValue([{
        products: [],
        totalCount: [{ count: 0 }]
      }]);
      
      const request = createRequest({ page: 'invalid' });
      const response = await GET(request);
      const data = await response.json();
      
      // Should default to page 1 when page is invalid
      expect(data.pagination.current).toBe(1);
    });
  });
});
