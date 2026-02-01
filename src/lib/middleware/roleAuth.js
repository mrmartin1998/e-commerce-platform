import { NextResponse } from 'next/server';
import { requireAuth } from './auth';
import { hasPermission, hasRole, hasMinimumRole, isAdmin as checkIsAdmin } from '@/lib/permissions/adminPermissions';

/**
 * ROLE-BASED AUTHORIZATION MIDDLEWARE
 * ====================================
 * 
 * Provides granular access control for admin routes based on user roles.
 * 
 * THREE MIDDLEWARE FUNCTIONS:
 * 1. requireRole() - Check if user has one of specified roles
 * 2. requirePermission() - Check if user can perform specific action on resource
 * 3. requireMinimumRole() - Check if user's role is >= minimum required
 * 
 * USAGE EXAMPLES:
 * 
 * // Only Super Admin can access
 * export const POST = requireRole(['super_admin'])(async function(request) {...});
 * 
 * // Super Admin or Admin can access
 * export const GET = requireRole(['super_admin', 'admin'])(async function(request) {...});
 * 
 * // Anyone who can delete products
 * export const DELETE = requirePermission('delete', 'Product')(async function(request) {...});
 * 
 * // Anyone with Editor role or higher
 * export const PATCH = requireMinimumRole('editor')(async function(request) {...});
 */

/**
 * Require user to have one of the specified roles
 * 
 * @param {Array<String>} allowedRoles - Array of role names that can access
 * @returns {Function} - Middleware wrapper
 * 
 * EXAMPLE:
 * export const POST = requireRole(['super_admin', 'admin'])(handler);
 * → Only Super Admin and Admin can call this endpoint
 */
export function requireRole(allowedRoles) {
  return function(handler) {
    return requireAuth(async (request, context) => {
      const user = request.user;
      
      // Check if user has one of the allowed roles
      if (!hasRole(user, allowedRoles)) {
        return NextResponse.json(
          { 
            error: 'Forbidden - Insufficient permissions',
            required: allowedRoles,
            current: user.role || 'none'
          },
          { status: 403 }
        );
      }
      
      // User has required role, continue to handler
      return handler(request, context);
    });
  };
}

/**
 * Require user to have specific permission for an action on a resource
 * 
 * @param {String} action - Action to check (create, read, update, delete, etc.)
 * @param {String} resource - Resource type (Product, User, Order, etc.)
 * @returns {Function} - Middleware wrapper
 * 
 * EXAMPLE:
 * export const DELETE = requirePermission('delete', 'Product')(handler);
 * → Only users who can delete products (Super Admin, Admin) can call this
 */
export function requirePermission(action, resource) {
  return function(handler) {
    return requireAuth(async (request, context) => {
      const user = request.user;
      
      // Check if user has the required permission
      if (!hasPermission(user, action, resource)) {
        return NextResponse.json(
          { 
            error: 'Forbidden - You do not have permission to perform this action',
            required: `${action} ${resource}`,
            role: user.role || 'none'
          },
          { status: 403 }
        );
      }
      
      // User has required permission, continue to handler
      return handler(request, context);
    });
  };
}

/**
 * Require user to have minimum role level
 * 
 * @param {String} minimumRole - Minimum required role
 * @returns {Function} - Middleware wrapper
 * 
 * EXAMPLE:
 * export const GET = requireMinimumRole('editor')(handler);
 * → Allows Editor, Admin, and Super Admin
 * → Denies Viewer and User
 */
export function requireMinimumRole(minimumRole) {
  return function(handler) {
    return requireAuth(async (request, context) => {
      const user = request.user;
      
      // Check if user meets minimum role requirement
      if (!hasMinimumRole(user, minimumRole)) {
        return NextResponse.json(
          { 
            error: 'Forbidden - Insufficient role level',
            required: `Minimum ${minimumRole}`,
            current: user.role || 'none'
          },
          { status: 403 }
        );
      }
      
      // User meets requirement, continue to handler
      return handler(request, context);
    });
  };
}

/**
 * Backward compatible admin check
 * Maintains compatibility with existing requireAdmin usage
 * 
 * @param {Function} handler - Route handler
 * @returns {Function} - Wrapped handler with admin check
 * 
 * EDUCATIONAL NOTE:
 * This replaces the old requireAdmin from adminAuth.js
 * Now checks for any admin role (viewer, editor, admin, super_admin)
 * instead of just checking isAdmin boolean
 */
export function requireAdmin(handler) {
  return requireAuth(async (request, context) => {
    const user = request.user;
    
    // Check if user is an admin (any admin role)
    if (!checkIsAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // User is admin, continue to handler
    return handler(request, context);
  });
}

/**
 * Check permission without blocking (for conditional features)
 * 
 * @param {Object} user - User object
 * @param {String} action - Action to check
 * @param {String} resource - Resource type
 * @returns {Boolean} - True if user has permission
 * 
 * USAGE IN API ROUTES:
 * const canDelete = checkPermission(request.user, 'delete', 'Product');
 * if (canDelete) {
 *   // Show delete button in response
 * }
 */
export function checkPermission(user, action, resource) {
  return hasPermission(user, action, resource);
}

/**
 * Export permission helpers for use in components
 */
export { hasPermission, hasRole, hasMinimumRole, checkIsAdmin as isAdmin };
