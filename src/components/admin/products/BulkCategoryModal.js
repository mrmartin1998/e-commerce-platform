'use client';

import { useState, useEffect } from 'react';

/**
 * BulkCategoryModal Component
 * 
 * Modal for bulk category assignment operation.
 * Fetches and displays available categories.
 */
export default function BulkCategoryModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productCount = 0,
  loading = false 
}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  async function fetchCategories() {
    try {
      setFetchingCategories(true);
      setError(null);
      
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setSelectedCategory(data.categories[0].slug);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setFetchingCategories(false);
    }
  }

  function handleConfirm() {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    onConfirm(selectedCategory);
  }

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Change Product Category</h3>
        
        <p className="mb-4">
          Assign category for <strong>{productCount}</strong> product{productCount !== 1 ? 's' : ''}
        </p>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Category Selection */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold">New Category</span>
          </label>
          
          {fetchingCategories ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : categories.length > 0 ? (
            <select
              className="select select-bordered w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="alert alert-warning">
              <span>No categories available</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button 
            onClick={onClose} 
            className="btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className={`btn btn-secondary ${loading ? 'loading' : ''}`}
            disabled={loading || fetchingCategories || categories.length === 0}
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
