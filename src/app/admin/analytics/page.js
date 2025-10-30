'use client';

import { useState } from 'react';
import SalesChart from '@/components/admin/dashboard/charts/SalesChart';
import InventoryAnalytics from '@/components/admin/dashboard/InventoryAnalytics';
import CustomerInsights from '@/components/admin/dashboard/CustomerInsights';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sales', label: 'Sales Analytics', icon: '💰' },
    { id: 'customers', label: 'Customer Insights', icon: '👥' },
    { id: 'inventory', label: 'Inventory Analytics', icon: '📦' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-base-100 shadow-xl rounded-box p-6">
                <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
                <div className="h-64">
                  <SalesChart />
                </div>
              </div>
              <div className="bg-base-100 shadow-xl rounded-box p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Total Revenue</div>
                    <div className="stat-value text-xl">$12,450</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Orders</div>
                    <div className="stat-value text-xl">342</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Customers</div>
                    <div className="stat-value text-xl">128</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Products</div>
                    <div className="stat-value text-xl">45</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity Summary */}
            <div className="bg-base-100 shadow-xl rounded-box p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="font-medium">5 new orders in the last hour</p>
                    <p className="text-sm opacity-70">Revenue: $487.50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-medium">3 new customers registered today</p>
                    <p className="text-sm opacity-70">Welcome emails sent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-medium">2 products low in stock</p>
                    <p className="text-sm opacity-70">Consider restocking soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'sales':
        return (
          <div className="space-y-6">
            <SalesChart />
            {/* Additional sales analytics can be added here */}
          </div>
        );
      case 'customers':
        return <CustomerInsights />;
      case 'inventory':
        return <InventoryAnalytics />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-base-content/70 mt-2">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex gap-2 mt-4 sm:mt-0">
          <select className="select select-bordered select-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 12 months</option>
          </select>
          <button className="btn btn-primary btn-sm">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
}
