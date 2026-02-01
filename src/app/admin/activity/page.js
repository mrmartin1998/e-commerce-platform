'use client';

import { useState, useEffect } from 'react';
import ActivityLogViewer from '@/components/admin/activity/ActivityLogViewer';
import { useToast } from '@/components/ui/Toast';

/**
 * ADMIN ACTIVITY LOG PAGE
 * ========================
 * 
 * Activity log viewer for Super Admins.
 * Shows complete audit trail of all admin actions.
 * 
 * FEATURES:
 * - View all admin activities
 * - Filter by action, resource, user, date
 * - Pagination
 * - Export capabilities (future)
 * 
 * SECURITY:
 * - Only accessible to Super Admins
 * - Logs cannot be modified or deleted
 */

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 50,
    totalRecords: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchActivities(1, filters);
  }, []);

  const fetchActivities = async (page = 1, activeFilters = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query string
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...activeFilters
      });

      const response = await fetch(`/api/admin/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setActivities(data.activities || []);
      setPagination(data.pagination || {
        current: page,
        total: 1,
        limit: 50,
        totalRecords: 0,
        hasMore: false
      });
    } catch (error) {
      console.error('Activity log fetch error:', error);
      showToast(error.message || 'Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchActivities(1, newFilters);
  };

  const handlePageChange = (newPage) => {
    fetchActivities(newPage, filters);
  };

  // Calculate summary statistics
  const stats = {
    total: pagination.totalRecords,
    create: activities.filter(a => a.action === 'CREATE').length,
    update: activities.filter(a => a.action === 'UPDATE' || a.action === 'BULK_UPDATE').length,
    delete: activities.filter(a => a.action === 'DELETE' || a.action === 'BULK_DELETE').length,
    roleChanges: activities.filter(a => a.action === 'ROLE_CHANGE').length
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-sm opacity-70 mt-2">Complete audit trail of admin actions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Total Activities</div>
          <div className="stat-value text-primary">{stats.total}</div>
          <div className="stat-desc">All time</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Created</div>
          <div className="stat-value text-success">{stats.create}</div>
          <div className="stat-desc">Current page</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Updated</div>
          <div className="stat-value text-info">{stats.update}</div>
          <div className="stat-desc">Current page</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Deleted</div>
          <div className="stat-value text-error">{stats.delete}</div>
          <div className="stat-desc">Current page</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Role Changes</div>
          <div className="stat-value text-accent">{stats.roleChanges}</div>
          <div className="stat-desc">Current page</div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Activity logs are automatically deleted after 6 months. Logs cannot be modified or deleted manually.</span>
      </div>

      {/* Activity Log Viewer */}
      <ActivityLogViewer
        activities={activities}
        onFilter={handleFilterChange}
        onPageChange={handlePageChange}
        pagination={pagination}
        loading={loading}
      />
    </div>
  );
}
