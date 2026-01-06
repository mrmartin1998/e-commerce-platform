'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function formatPrice(price) {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <tr key={product._id}>
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
    </div>
  );
}
