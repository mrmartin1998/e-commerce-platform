'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';
import BulkActionsBar from '@/components/admin/products/BulkActionsBar';
import BulkDeleteModal from '@/components/admin/products/BulkDeleteModal';
import BulkStatusModal from '@/components/admin/products/BulkStatusModal';
import BulkCategoryModal from '@/components/admin/products/BulkCategoryModal';

function formatPrice(price) {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setProducts(data.products);
      } catch (err) {
        console.error('Products fetch error:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function handleDeleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product');
    }
  }

  // Handle select/deselect individual product
  function handleSelectProduct(productId) {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }

  // Handle select all / deselect all
  function handleSelectAll(checked) {
    if (checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  }

  // Check if all products are selected
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  // Get selected product objects for display in modals
  const selectedProductObjects = products.filter(p => selectedProducts.includes(p._id));

  // Bulk delete handler
  async function handleBulkDelete() {
    try {
      setBulkOperationLoading(true);
      
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productIds: selectedProducts })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete products');
      }

      showToast(data.message, 'success');
      
      // Refresh products list
      setProducts(products.filter(p => !selectedProducts.includes(p._id)));
      setSelectedProducts([]);
      setShowBulkDeleteModal(false);

    } catch (err) {
      console.error('Bulk delete error:', err);
      showToast(err.message, 'error');
    } finally {
      setBulkOperationLoading(false);
    }
  }

  // Bulk status update handler
  async function handleBulkStatusUpdate(newStatus) {
    try {
      setBulkOperationLoading(true);
      
      const response = await fetch('/api/admin/products/bulk-update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          productIds: selectedProducts,
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product status');
      }

      showToast(data.message, 'success');
      
      // Update products in state
      setProducts(products.map(p => 
        selectedProducts.includes(p._id) 
          ? { ...p, status: newStatus }
          : p
      ));
      setSelectedProducts([]);
      setShowBulkStatusModal(false);

    } catch (err) {
      console.error('Bulk status update error:', err);
      showToast(err.message, 'error');
    } finally {
      setBulkOperationLoading(false);
    }
  }

  // Bulk category update handler
  async function handleBulkCategoryUpdate(newCategory) {
    try {
      setBulkOperationLoading(true);
      
      const response = await fetch('/api/admin/products/bulk-update-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          productIds: selectedProducts,
          category: newCategory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product category');
      }

      showToast(data.message, 'success');
      
      // Update products in state
      setProducts(products.map(p => 
        selectedProducts.includes(p._id) 
          ? { ...p, category: newCategory }
          : p
      ));
      setSelectedProducts([]);
      setShowBulkCategoryModal(false);

    } catch (err) {
      console.error('Bulk category update error:', err);
      showToast(err.message, 'error');
    } finally {
      setBulkOperationLoading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link href="/admin/products/add" className="btn btn-primary">
          Add New Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all products"
                  />
                </label>
              </th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className={selectedProducts.includes(product._id) ? 'active' : ''}>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </label>
                </td>
                <td>
                  <div className="w-16 h-16 relative">
                    <Image
                      src={product.images?.[0]?.url || '/images/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                      loading="lazy"
                    />
                    {product.images?.length > 1 && (
                      <div className="absolute -top-1 -right-1">
                        <span className="badge badge-primary badge-xs">
                          +{product.images.length - 1}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td>{product.name}</td>
                <td>${formatPrice(product.price)}</td>
                <td>{product.stock || 'N/A'}</td>
                <td>
                  <span className={`badge ${
                    product.status === 'published' ? 'badge-success' : 
                    product.status === 'draft' ? 'badge-warning' : 
                    'badge-error'
                  }`}>
                    {product.status || 'draft'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/products/${product._id}/edit`}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedProducts.length}
        onDelete={() => setShowBulkDeleteModal(true)}
        onChangeStatus={() => setShowBulkStatusModal(true)}
        onChangeCategory={() => setShowBulkCategoryModal(true)}
        onDeselectAll={() => setSelectedProducts([])}
        loading={bulkOperationLoading}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        products={selectedProductObjects}
        loading={bulkOperationLoading}
      />

      {/* Bulk Status Modal */}
      <BulkStatusModal
        isOpen={showBulkStatusModal}
        onClose={() => setShowBulkStatusModal(false)}
        onConfirm={handleBulkStatusUpdate}
        productCount={selectedProducts.length}
        loading={bulkOperationLoading}
      />

      {/* Bulk Category Modal */}
      <BulkCategoryModal
        isOpen={showBulkCategoryModal}
        onClose={() => setShowBulkCategoryModal(false)}
        onConfirm={handleBulkCategoryUpdate}
        productCount={selectedProducts.length}
        loading={bulkOperationLoading}
      />
    </div>
  );
}
