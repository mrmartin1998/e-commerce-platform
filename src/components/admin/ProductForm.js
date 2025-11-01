"use client";

import { useState } from 'react';
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
    status: initialData?.status || 'draft',
    images: initialData?.images || [],
  });
  const [uploadingImage, setUploadingImage] = useState(false);

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
          <label className="label">Category</label>
          <input
            type="text"
            className="input input-bordered"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          />
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
          disabled={loading}
        >
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}