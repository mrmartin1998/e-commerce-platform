'use client';

import { useState, useEffect } from 'react';
import UserManagement from '@/components/admin/users/UserManagement';
import RoleAssignmentModal from '@/components/admin/users/RoleAssignmentModal';
import { useToast } from '@/components/ui/Toast';

/**
 * ADMIN USERS PAGE
 * ================
 * 
 * User management dashboard for Super Admins.
 * Allows viewing all users, changing roles, and managing access.
 * 
 * FEATURES:
 * - List all users with search and filter
 * - Change user roles
 * - Delete users (with safeguards)
 * - View user statistics
 * 
 * SECURITY:
 * - Only accessible to Super Admins
 * - Cannot modify your own role
 * - Cannot delete the last Super Admin
 */

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const { showToast } = useToast();

  // Fetch current user
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error('Users fetch error:', error);
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, reason) => {
    try {
      setRoleChangeLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole, reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      showToast(data.message || 'Role updated successfully', 'success');
      setSelectedUser(null);
      
      // Refresh users list
      await fetchUsers();
      
    } catch (error) {
      console.error('Role change error:', error);
      showToast(error.message, 'error');
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      showToast(data.message || 'User deleted successfully', 'success');
      
      // Refresh users list
      await fetchUsers();
      
    } catch (error) {
      console.error('Delete user error:', error);
      showToast(error.message, 'error');
    }
  };

  // Calculate user statistics
  const stats = {
    total: users.length,
    admins: users.filter(u => ['admin', 'super_admin'].includes(u.role)).length,
    editors: users.filter(u => u.role === 'editor').length,
    viewers: users.filter(u => u.role === 'viewer').length,
    regular: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-sm opacity-70 mt-2">Manage user roles and permissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Super Admins</div>
          <div className="stat-value text-accent">{stats.admins}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Editors</div>
          <div className="stat-value text-secondary">{stats.editors}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Viewers</div>
          <div className="stat-value text-info">{stats.viewers}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-title">Regular Users</div>
          <div className="stat-value">{stats.regular}</div>
        </div>
      </div>

      {/* User Management Component */}
      <UserManagement
        users={users}
        currentUser={currentUser}
        onRoleChange={(user) => setSelectedUser(user)}
        onDelete={handleDeleteUser}
        onRefresh={fetchUsers}
        loading={loading}
      />

      {/* Role Assignment Modal */}
      {selectedUser && (
        <RoleAssignmentModal
          isOpen={!!selectedUser}
          user={selectedUser}
          onConfirm={handleRoleChange}
          onCancel={() => setSelectedUser(null)}
          loading={roleChangeLoading}
        />
      )}
    </div>
  );
}
