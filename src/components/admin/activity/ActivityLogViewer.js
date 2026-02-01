'use client';

import { useState } from 'react';
import { getRoleName, getRoleBadgeClass } from '@/lib/permissions/adminPermissions';

/**
 * ACTIVITY LOG VIEWER COMPONENT
 * ==============================
 * 
 * Displays admin activity logs in a filterable table.
 * Super Admin only - provides complete audit trail.
 * 
 * FEATURES:
 * - Filter by user, action, resource, date range
 * - Pagination
 * - Color-coded action badges
 * - Detailed view of each activity
 * - Export capability (future)
 * 
 * PROPS:
 * - activities: Array of activity log entries
 * - onFilter: Callback when filters change
 * - onPageChange: Callback when page changes
 * - pagination: Pagination metadata
 * - loading: Loading state
 */

const ACTION_COLORS = {
  CREATE: 'badge-success',
  UPDATE: 'badge-info',
  DELETE: 'badge-error',
  BULK_DELETE: 'badge-error',
  BULK_UPDATE: 'badge-warning',
  ROLE_CHANGE: 'badge-primary',
  STATUS_CHANGE: 'badge-info',
  VIEW: 'badge-ghost',
  LOGIN: 'badge-ghost',
  LOGOUT: 'badge-ghost',
  EXPORT: 'badge-accent'
};

export default function ActivityLogViewer({ 
  activities = [], 
  onFilter,
  onPageChange,
  pagination = {},
  loading = false 
}) {
  const [filters, setFilters] = useState({
    action: 'all',
    resource: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Trigger callback with active filters
    if (onFilter) {
      const activeFilters = {};
      if (newFilters.action !== 'all') activeFilters.action = newFilters.action;
      if (newFilters.resource !== 'all') activeFilters.resource = newFilters.resource;
      if (newFilters.search) activeFilters.search = newFilters.search;
      if (newFilters.startDate) activeFilters.startDate = newFilters.startDate;
      if (newFilters.endDate) activeFilters.endDate = newFilters.endDate;
      
      onFilter(activeFilters);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return 'No details';
    }

    // Format common detail patterns
    if (details.count !== undefined) {
      return `${details.count} items`;
    }

    if (details.oldRole && details.newRole) {
      return `${getRoleName(details.oldRole)} → ${getRoleName(details.newRole)}`;
    }

    if (details.oldStatus && details.newStatus) {
      return `${details.oldStatus} → ${details.newStatus}`;
    }

    // Generic formatting
    return Object.entries(details)
      .slice(0, 3) // Limit to first 3 entries
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Action Filter */}
        <select
          className="select select-bordered"
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="BULK_DELETE">Bulk Delete</option>
          <option value="BULK_UPDATE">Bulk Update</option>
          <option value="ROLE_CHANGE">Role Change</option>
          <option value="STATUS_CHANGE">Status Change</option>
        </select>

        {/* Resource Filter */}
        <select
          className="select select-bordered"
          value={filters.resource}
          onChange={(e) => handleFilterChange('resource', e.target.value)}
        >
          <option value="all">All Resources</option>
          <option value="Product">Product</option>
          <option value="User">User</option>
          <option value="Order">Order</option>
          <option value="Category">Category</option>
          <option value="Review">Review</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          className="input input-bordered"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          placeholder="Start Date"
        />

        {/* End Date */}
        <input
          type="date"
          className="input input-bordered"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          placeholder="End Date"
        />

        {/* Clear Filters */}
        <button
          className="btn btn-outline"
          onClick={() => {
            setFilters({
              action: 'all',
              resource: 'all',
              search: '',
              startDate: '',
              endDate: ''
            });
            if (onFilter) onFilter({});
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      <div className="text-sm opacity-70">
        {pagination.totalRecords} total activities
      </div>

      {/* Activity Log Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 opacity-70">
                  No activity logs found
                </td>
              </tr>
            ) : (
              activities.map(activity => (
                <tr key={activity._id}>
                  {/* Timestamp */}
                  <td className="text-sm">
                    {formatDate(activity.createdAt)}
                  </td>

                  {/* User */}
                  <td>
                    {activity.userId ? (
                      <div>
                        <div className="font-medium">{activity.userId.name || 'Unknown'}</div>
                        <div className="text-xs opacity-70">{activity.userId.email || ''}</div>
                        {activity.userId.role && (
                          <div className={`badge badge-sm ${getRoleBadgeClass(activity.userId.role)} mt-1`}>
                            {getRoleName(activity.userId.role)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="opacity-70">System</span>
                    )}
                  </td>

                  {/* Action Badge */}
                  <td>
                    <span className={`badge ${ACTION_COLORS[activity.action] || 'badge-ghost'}`}>
                      {activity.action}
                    </span>
                  </td>

                  {/* Resource */}
                  <td>
                    <span className="font-medium">{activity.resource}</span>
                  </td>

                  {/* Details */}
                  <td className="text-sm opacity-70 max-w-xs truncate">
                    {formatDetails(activity.details)}
                  </td>

                  {/* IP Address */}
                  <td className="text-xs opacity-50">
                    {activity.metadata?.ipAddress || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex justify-center gap-2">
          <button
            className="btn btn-sm"
            onClick={() => onPageChange(pagination.current - 1)}
            disabled={pagination.current <= 1}
          >
            Previous
          </button>
          
          <span className="flex items-center px-4">
            Page {pagination.current} of {pagination.total}
          </span>
          
          <button
            className="btn btn-sm"
            onClick={() => onPageChange(pagination.current + 1)}
            disabled={!pagination.hasMore}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
