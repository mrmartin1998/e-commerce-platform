'use client';

import { useState } from 'react';
import { getRoleName, getRoleBadgeClass } from '@/lib/permissions/adminPermissions';

/**
 * USER MANAGEMENT COMPONENT
 * ==========================
 * 
 * Displays a table of all users with role management capabilities.
 * Super Admins can change user roles, view activity, and manage users.
 * 
 * FEATURES:
 * - Search users by name or email
 * - Filter by role
 * - Pagination
 * - Role assignment modal
 * - User status indicators
 * 
 * PROPS:
 * - users: Array of user objects
 * - onRoleChange: Callback when role is changed
 * - onDelete: Callback when user is deleted
 * - currentUser: Current logged-in user
 * - loading: Loading state
 */

export default function UserManagement({ 
  users = [], 
  onRoleChange, 
  onDelete,
  onRefresh,
  currentUser,
  loading = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleClick = (user) => {
    // Cannot edit your own role
    if (currentUser && user._id === currentUser._id) {
      alert('You cannot change your own role');
      return;
    }
    
    setSelectedUser(user);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      {/* Search and Filter Bar */}
      <div className="flex gap-4 flex-wrap items-center">
        {/* Search Input */}
        <div className="form-control flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select
          className="select select-bordered"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="viewer">Viewers</option>
          <option value="editor">Editors</option>
          <option value="admin">Admins</option>
          <option value="super_admin">Super Admins</option>
        </select>

        {/* Refresh Button */}
        <button 
          className="btn btn-outline"
          onClick={onRefresh}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Results Count */}
      <div className="text-sm opacity-70">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 opacity-70">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id} className={user._id === currentUser?._id ? 'bg-base-200' : ''}>
                  {/* User Name with Badge if current user */}
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{user.name}</div>
                      {user._id === currentUser?._id && (
                        <span className="badge badge-sm">You</span>
                      )}
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <span className="text-sm opacity-70">{user.email}</span>
                  </td>

                  {/* Role Badge (clickable to change) */}
                  <td>
                    <button
                      className={`badge ${getRoleBadgeClass(user.role)} gap-2 cursor-pointer hover:opacity-80`}
                      onClick={() => handleRoleClick(user)}
                      disabled={user._id === currentUser?._id}
                    >
                      {getRoleName(user.role)}
                      {user._id !== currentUser?._id && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      )}
                    </button>
                  </td>

                  {/* Created Date */}
                  <td className="text-sm opacity-70">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Last Updated */}
                  <td className="text-sm opacity-70">
                    {formatDate(user.updatedAt)}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex gap-2">
                      {/* Delete Button (cannot delete yourself) */}
                      {user._id !== currentUser?._id && (
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => {
                            if (confirm(`Delete user ${user.name}?`)) {
                              onDelete(user._id);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal (rendered by parent component) */}
      {selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Change User Role</h3>
            <p className="mb-4">
              Changing role for: <strong>{selectedUser.name}</strong>
            </p>
            <p className="text-sm opacity-70 mb-4">
              Current role: <span className={`badge ${getRoleBadgeClass(selectedUser.role)}`}>
                {getRoleName(selectedUser.role)}
              </span>
            </p>
            
            {/* This will be replaced with RoleAssignmentModal component */}
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
