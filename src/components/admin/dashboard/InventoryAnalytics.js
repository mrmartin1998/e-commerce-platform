'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { StatCardSkeleton, TableSkeleton, ErrorState } from '@/components/ui/SkeletonLoader';

export default function InventoryAnalytics() {
  const [inventoryData, setData] = useState({
    overview: {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalStockValue: 0
    },
    categoryAnalytics: [],
    lowStockProducts: [],
    productPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchInventoryData() {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/analytics/inventory', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const retryFetch = () => {
    fetchInventoryData();
  };

  if (error && !loading) {
    return (
      <ErrorState
        title="Inventory Analytics Error"
        message={error}
        onRetry={retryFetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-base-100 shadow-xl rounded-box p-6">
              <h3 className="text-sm font-medium opacity-70">Total Products</h3>
              <p className="text-3xl font-bold mt-2">{inventoryData.overview.totalProducts}</p>
            </div>
            <div className="bg-base-100 shadow-xl rounded-box p-6">
              <h3 className="text-sm font-medium opacity-70">Low Stock Items</h3>
              <p className="text-3xl font-bold mt-2">{inventoryData.overview.lowStockItems}</p>
            </div>
            <div className="bg-base-100 shadow-xl rounded-box p-6">
              <h3 className="text-sm font-medium opacity-70">Out of Stock</h3>
              <p className="text-3xl font-bold mt-2">{inventoryData.overview.outOfStockItems}</p>
            </div>
            <div className="bg-base-100 shadow-xl rounded-box p-6">
              <h3 className="text-sm font-medium opacity-70">Total Stock Value</h3>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(inventoryData.overview.totalStockValue)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Low Stock Alerts</h2>
        </div>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category || 'Uncategorized'}</td>
                    <td>{product.stock}</td>
                    <td>{product.threshold}</td>
                    <td>
                      <span className={`badge ${
                        product.stock === 0 ? 'badge-error' : 'badge-warning'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `Low Stock (≤${product.threshold})`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Analysis */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Category Analysis</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-base-200 p-4 rounded-lg">
                  <div className="skeleton h-5 w-24 mb-2"></div>
                  <div className="skeleton h-4 w-32 mb-1"></div>
                  <div className="skeleton h-4 w-28 mb-1"></div>
                  <div className="skeleton h-4 w-36"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inventoryData.categoryAnalytics.map((category) => (
                <div key={category.category} className="bg-base-200 p-4 rounded-lg">
                  <h3 className="font-medium">{category.category}</h3>
                  <div className="mt-2 space-y-1 opacity-70">
                    <p>Total Items: {category.totalItems}</p>
                    <p>Low Stock Items: {category.lowStock}</p>
                    <p>Stock Value: {formatCurrency(category.stockValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Product Performance</h2>
        </div>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={10} columns={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Total Sales</th>
                  <th>Turnover Rate</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.productPerformance.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.stock}</td>
                    <td>{product.sales}</td>
                    <td>{(product.turnoverRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}