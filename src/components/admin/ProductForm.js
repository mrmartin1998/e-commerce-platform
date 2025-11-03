"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageManager from './ImageManager';

export default function ProductForm({ initialData, isEditing }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || '',
    stock: initialData?.stock || '',
    lowStockThreshold: initialData?.lowStockThreshold || 10,
    status: initialData?.status || 'draft',
    images: initialData?.images || [],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategoriesLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/categories', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setCategories(data.categories);
      } catch (err) {
        console.error('Categories fetch error:', err);
        // If categories fail to load, fall back to default options
        setCategories([
          { _id: 'electronics', name: 'Electronics', slug: 'electronics' },
          { _id: 'clothing', name: 'Clothing', slug: 'clothing' },
          { _id: 'books', name: 'Books', slug: 'books' },
          { _id: 'home', name: 'Home & Kitchen', slug: 'home' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `/api/products/${initialData._id}`
        : '/api/products';
      
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Get selected category details for threshold display
  const selectedCategory = categories.find(cat => 
    cat.slug === formData.category || cat._id === formData.category
  );

  // Update threshold when category changes (if product doesn't have custom threshold)
  const handleCategoryChange = (categorySlug) => {
    setFormData(prev => ({ ...prev, category: categorySlug }));
  };

  // Build hierarchical category options
  const buildCategoryOptions = () => {
    const topLevel = categories.filter(cat => !cat.parentCategory);
    const children = categories.filter(cat => cat.parentCategory);
    
    const options = [];
    
    topLevel.forEach(parent => {
      options.push(parent);
      
      // Add children indented
      const parentChildren = children.filter(child => 
        child.parentCategory._id === parent._id
      );
      parentChildren.forEach(child => {
        options.push({ ...child, isChild: true });
      });
    });
    
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h2>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-control">
          <label className="label">Name</label>
          <input
            type="text"
            className="input input-bordered"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          {categoriesLoading ? (
            <div className="skeleton h-12 w-full"></div>
          ) : (
            <>
              <select
                className="select select-bordered"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {buildCategoryOptions().map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.isChild ? '  ↳ ' : ''}{category.name}
                    {category.metadata?.icon && ` ${category.metadata.icon}`}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt">
                  {categories.length} categories available • 
                  <a href="/admin/categories" className="link link-primary ml-1">
                    Manage Categories
                  </a>
                </span>
              </label>
            </>
          )}
        </div>

        <div className="form-control">
          <label className="label">Price</label>
          <input
            type="number"
            step="0.01"
            className="input input-bordered"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Stock</label>
          <input
            type="number"
            className="input input-bordered"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Low Stock Threshold</span>
            <span className="label-text-alt">Alert when stock hits this level</span>
          </label>
          <input
            type="number"
            min="0"
            className="input input-bordered"
            value={formData.lowStockThreshold}
            onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value) || 0})}
            placeholder="10"
          />
          <label className="label">
            <span className="label-text-alt">
              Current stock: {formData.stock || 0} | 
              {formData.stock <= formData.lowStockThreshold ? ' ⚠️ Low stock alert!' : ' ✅ Stock OK'}
            </span>
          </label>
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="textarea textarea-bordered h-24"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">Status</label>
          <select 
            className="select select-bordered"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text font-semibold">Product Images</span>
          </label>
          <ImageManager
            images={formData.images}
            onChange={handleImageChange}
            maxImages={5}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          type="button" 
          className="btn btn-ghost"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading || categoriesLoading}
        >
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}