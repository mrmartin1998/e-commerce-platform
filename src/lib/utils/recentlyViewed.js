/**
 * Recently Viewed Products Utility
 * Manages localStorage operations for tracking product views
 * Max items: 10 (FIFO when exceeded)
 */

const RECENTLY_VIEWED_KEY = 'ecommerce_recently_viewed';
const MAX_ITEMS = 10;

/**
 * Get stored recently viewed products from localStorage
 * @returns {Array} Array of product objects
 */
const getStoredProducts = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading recently viewed from localStorage:', error);
    return [];
  }
};

/**
 * Store recently viewed products to localStorage
 * @param {Array} products - Array of product objects
 */
const storeProducts = (products) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error storing recently viewed to localStorage:', error);
  }
};

/**
 * Add a product to recently viewed
 * Prevents duplicates and maintains max 10 items (most recent first)
 * @param {Object} product - Product object with _id, name, price, image
 */
export const addToRecentlyViewed = (product) => {
  if (!product || !product._id) return;
  
  const products = getStoredProducts();
  
  // Remove duplicate if exists (we'll add it to front)
  const filtered = products.filter(p => p._id !== product._id);
  
  // Create product entry with minimal data
  const productEntry = {
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.images?.[0]?.url || product.image || '/images/placeholder.png',
    category: product.category,
    viewedAt: Date.now()
  };
  
  // Add to front
  const updated = [productEntry, ...filtered];
  
  // Limit to MAX_ITEMS
  const limited = updated.slice(0, MAX_ITEMS);
  
  storeProducts(limited);
};

/**
 * Get all recently viewed products
 * @returns {Array} Array of recently viewed products (most recent first)
 */
export const getRecentlyViewed = () => {
  return getStoredProducts();
};

/**
 * Clear all recently viewed products
 */
export const clearRecentlyViewed = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed from localStorage:', error);
  }
};

/**
 * Remove a specific product from recently viewed
 * @param {string} productId - Product ID to remove
 */
export const removeFromRecentlyViewed = (productId) => {
  if (!productId) return;
  
  const products = getStoredProducts();
  const filtered = products.filter(p => p._id !== productId);
  storeProducts(filtered);
};

/**
 * Get recently viewed excluding specific product IDs
 * Useful for product detail page to exclude current product
 * @param {string|Array} excludeIds - Product ID(s) to exclude
 * @returns {Array} Filtered array of recently viewed products
 */
export const getRecentlyViewedExcluding = (excludeIds) => {
  const products = getStoredProducts();
  const idsToExclude = Array.isArray(excludeIds) ? excludeIds : [excludeIds];
  return products.filter(p => !idsToExclude.includes(p._id));
};
