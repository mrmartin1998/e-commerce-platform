'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import CategoryList from '@/components/admin/categories/CategoryList';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/categories?includeInactive=true', {
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
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryCreated = (newCategory) => {
    setCategories([...categories, newCategory]);
    setShowForm(false);
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories(categories.map(cat => 
      cat._id === updatedCategory._id ? updatedCategory : cat
    ));
    setEditingCategory(null);
  };

  const handleCategoryDeleted = (categoryId) => {
    setCategories(categories.filter(cat => cat._id !== categoryId));
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchCategories} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-base-content/70 mt-2">
            Organize products with dynamic categories and hierarchies
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin" className="btn btn-ghost">
            ← Back to Admin
          </Link>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              + Add Category
            </button>
          )}
        </div>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <CategoryForm
                category={editingCategory}
                categories={categories}
                onSuccess={editingCategory ? handleCategoryUpdated : handleCategoryCreated}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Categories</div>
          <div className="stat-value">{categories.length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Active Categories</div>
          <div className="stat-value">
            {categories.filter(cat => cat.isActive).length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Top Level</div>
          <div className="stat-value">
            {categories.filter(cat => !cat.parentCategory).length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Subcategories</div>
          <div className="stat-value">
            {categories.filter(cat => cat.parentCategory).length}
          </div>
        </div>
      </div>

      {/* Category List */}
      <CategoryList
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleCategoryDeleted}
        onRefresh={fetchCategories}
      />
    </div>
  );
}
