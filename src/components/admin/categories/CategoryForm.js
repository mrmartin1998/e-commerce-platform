'use client';

import { useState } from 'react';

export default function CategoryForm({ category, categories, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    parentCategory: category?.parentCategory?._id || '',
    isActive: category?.isActive ?? true,
    metadata: {
      color: category?.metadata?.color || '',
      icon: category?.metadata?.icon || ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = category
        ? `/api/admin/categories/${category._id}`
        : '/api/admin/categories';
      
      const method = category ? 'PUT' : 'POST';
      
      // Clean up form data before sending
      const cleanFormData = {
        ...formData,
        // Convert empty string to null for parentCategory
        parentCategory: formData.parentCategory || null,
        // Ensure metadata is properly structured
        metadata: {
          ...formData.metadata,
          // Remove empty values
          color: formData.metadata.color || undefined,
          icon: formData.metadata.icon || undefined
        }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${category ? 'update' : 'create'} category`);
      }

      onSuccess(data.category);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Filter out current category and its children from parent options
  const availableParentCategories = categories.filter(cat => {
    if (category && cat._id === category._id) return false;
    if (category && cat.parentCategory === category._id) return false;
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="Electronics, Clothing, etc."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of this category..."
              rows="3"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Parent Category</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.parentCategory}
              onChange={(e) => handleChange('parentCategory', e.target.value)}
            >
              <option value="">None (Top Level Category)</option>
              {availableParentCategories
                .filter(cat => !cat.parentCategory) // Only show top-level categories as parents
                .map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Settings & Appearance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Settings & Appearance</h3>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category Color</span>
              <span className="label-text-alt">For UI theming</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-12 rounded border"
                value={formData.metadata.color}
                onChange={(e) => handleChange('metadata.color', e.target.value)}
              />
              <input
                type="text"
                className="input input-bordered flex-1"
                value={formData.metadata.color}
                onChange={(e) => handleChange('metadata.color', e.target.value)}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Icon/Emoji</span>
              <span className="label-text-alt">Display icon for category</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.metadata.icon}
              onChange={(e) => handleChange('metadata.icon', e.target.value)}
              placeholder="📱, 👕, 📚, 🏠"
              maxLength="10"
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Active Status</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            </label>
            <div className="label">
              <span className="label-text-alt">
                {formData.isActive ? 'Category is visible and usable' : 'Category is hidden from users'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6">
        <button 
          type="button" 
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
