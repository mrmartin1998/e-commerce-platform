'use client';

import { useState } from 'react';
import { ROLES, getRoleName, getRoleBadgeClass } from '@/lib/permissions/adminPermissions';

/**
 * ROLE ASSIGNMENT MODAL
 * ======================
 * 
 * Modal dialog for changing a user's role.
 * Shows permission comparison and requires confirmation.
 * 
 * FEATURES:
 * - Role dropdown with all available roles
 * - Permission comparison (current vs new)
 * - Optional reason field
 * - Warning for critical changes
 * - Loading state during update
 * 
 * PROPS:
 * - isOpen: Whether modal is visible
 * - user: User object whose role is being changed
 * - onConfirm: Callback with (userId, newRole, reason)
 * - onCancel: Callback to close modal
 * - loading: Loading state
 */

const PERMISSION_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: [
    'Full system access',
    'Manage all users and roles',
    'View activity logs',
    'All admin permissions'
  ],
  [ROLES.ADMIN]: [
    'Manage products and inventory',
    'Manage orders and fulfillment',
    'Moderate reviews',
    'Manage categories',
    'Cannot manage users or roles'
  ],
  [ROLES.EDITOR]: [
    'Create and edit products',
    'Edit categories',
    'View orders (read-only)',
    'Cannot delete or manage users'
  ],
  [ROLES.VIEWER]: [
    'View dashboard and analytics',
    'Read-only access',
    'Cannot modify any data'
  ],
  [ROLES.USER]: [
    'Regular customer account',
    'No admin access'
  ]
};

export default function RoleAssignmentModal({ 
  isOpen, 
  user, 
  onConfirm, 
  onCancel, 
  loading = false 
}) {
  const [selectedRole, setSelectedRole] = useState(user?.role || ROLES.USER);
  const [reason, setReason] = useState('');

  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    if (selectedRole === user.role) {
      alert('Please select a different role');
      return;
    }

    onConfirm(user._id, selectedRole, reason);
  };

  const isDemotion = () => {
    const roleHierarchy = {
      [ROLES.USER]: 0,
      [ROLES.VIEWER]: 1,
      [ROLES.EDITOR]: 2,
      [ROLES.ADMIN]: 3,
      [ROLES.SUPER_ADMIN]: 4
    };

    return roleHierarchy[selectedRole] < roleHierarchy[user.role];
  };

  const isPromotion = () => {
    const roleHierarchy = {
      [ROLES.USER]: 0,
      [ROLES.VIEWER]: 1,
      [ROLES.EDITOR]: 2,
      [ROLES.ADMIN]: 3,
      [ROLES.SUPER_ADMIN]: 4
    };

    return roleHierarchy[selectedRole] > roleHierarchy[user.role];
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Change User Role</h3>

        {/* User Info */}
        <div className="mb-6 p-4 bg-base-200 rounded-lg">
          <div className="font-medium">{user.name}</div>
          <div className="text-sm opacity-70">{user.email}</div>
        </div>

        {/* Current Role */}
        <div className="mb-4">
          <label className="label">
            <span className="label-text font-medium">Current Role</span>
          </label>
          <div className={`badge ${getRoleBadgeClass(user.role)} badge-lg`}>
            {getRoleName(user.role)}
          </div>
        </div>

        {/* New Role Selection */}
        <div className="mb-4">
          <label className="label">
            <span className="label-text font-medium">New Role</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
          >
            <option value={ROLES.USER}>User (Regular Customer)</option>
            <option value={ROLES.VIEWER}>Viewer (Read-Only Admin)</option>
            <option value={ROLES.EDITOR}>Editor (Content Manager)</option>
            <option value={ROLES.ADMIN}>Admin (Operations Manager)</option>
            <option value={ROLES.SUPER_ADMIN}>Super Admin (Full Access)</option>
          </select>
        </div>

        {/* Warning for Demotion */}
        {isDemotion() && (
          <div className="alert alert-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Warning: This is a demotion. The user will lose access to certain features.</span>
          </div>
        )}

        {/* Warning for Super Admin */}
        {selectedRole === ROLES.SUPER_ADMIN && user.role !== ROLES.SUPER_ADMIN && (
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Super Admin has full system access including user management and activity logs.</span>
          </div>
        )}

        {/* Permission Comparison */}
        <div className="mb-4">
          <label className="label">
            <span className="label-text font-medium">New Permissions</span>
          </label>
          <div className="p-4 bg-base-200 rounded-lg">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {PERMISSION_DESCRIPTIONS[selectedRole]?.map((perm, idx) => (
                <li key={idx}>{perm}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reason (Optional) */}
        <div className="mb-6">
          <label className="label">
            <span className="label-text">Reason for change (optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="e.g., Promotion to team lead, temporary access, etc."
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button 
            className="btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading || selectedRole === user.role}
          >
            {loading && <span className="loading loading-spinner"></span>}
            {loading ? 'Updating...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  );
}
