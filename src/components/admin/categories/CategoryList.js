'use client';

import React, { useState } from 'react';

export default function CategoryList({ categories, onEdit, onDelete, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (category) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${category.name}"?\n\n` +
      `This action cannot be undone. Make sure no products are using this category.`
    );
    
    if (!confirmed) return;

    setDeleting(category._id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      onDelete(category._id);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const toggleStatus = async (category) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !category.isActive
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category status');
      }

      onRefresh();
    } catch (err) {
      console.error('Status update error:', err);
      alert(err.message);
    }
  };

  // Filter and organize categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Organize into hierarchy
  const topLevelCategories = filteredCategories.filter(cat => !cat.parentCategory);
  const subcategoriesMap = filteredCategories.reduce((acc, cat) => {
    if (cat.parentCategory) {
      const parentId = cat.parentCategory._id || cat.parentCategory;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(cat);
    }
    return acc;
  }, {});

  const renderCategoryRow = (category, isSubcategory = false) => (
    <tr key={category._id} className={isSubcategory ? 'bg-base-200/50' : ''}>
      <td>
        <div className="flex items-center gap-2">
          {isSubcategory && <span className="text-base-content/50">↳</span>}
          <span className="text-lg">{category.metadata?.icon}</span>
          <div>
            <div className="font-bold">{category.name}</div>
            {category.description && (
              <div className="text-sm opacity-50">{category.description}</div>
            )}
          </div>
        </div>
      </td>
      <td>
        {category.parentCategory && (
          <span className="badge badge-outline">
            {category.parentCategory.name}
          </span>
        )}
      </td>
      <td>
        <div className="text-center">{category.metadata?.productCount || 0}</div>
      </td>
      <td>
        <button
          onClick={() => toggleStatus(category)}
          className={`badge ${category.isActive ? 'badge-success' : 'badge-error'} cursor-pointer`}
        >
          {category.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="btn btn-sm btn-outline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(category)}
            className={`btn btn-sm btn-error ${
              deleting === category._id ? 'loading' : ''
            }`}
            disabled={deleting === category._id}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Categories</h2>
          
          {/* Search */}
          <div className="form-control">
            <input
              type="text"
              placeholder="Search categories..."
              className="input input-bordered input-sm w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Parent</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topLevelCategories.map(category => (
                <React.Fragment key={category._id}>
                  {renderCategoryRow(category)}
                  {subcategoriesMap[category._id]?.map(subcat =>
                    renderCategoryRow(subcat, true)
                  )}
                </React.Fragment>
              ))}
              
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    {searchTerm ? 'No categories match your search' : 'No categories found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
