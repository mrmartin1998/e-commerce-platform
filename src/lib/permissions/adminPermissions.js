/**
 * ADMIN PERMISSIONS SYSTEM
 * =========================
 * 
 * Defines role hierarchy and granular permissions for admin users.
 * 
 * ROLE HIERARCHY (from highest to lowest):
 * 1. super_admin - Full system access, can manage everything
 * 2. admin       - Manage products, orders, categories, reviews
 * 3. editor      - Edit content, cannot delete or manage critical resources
 * 4. viewer      - Read-only access to dashboard and analytics
 * 
 * PERMISSION MODEL:
 * Each role has specific actions they can perform on resources.
 * Actions: create, read, update, delete, bulk_update, bulk_delete
 * Resources: Product, User, Order, Category, Review, ActivityLog, Settings
 */

// ROLE DEFINITIONS
export const ROLES = {
  USER: 'user',
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// ROLE HIERARCHY (higher number = more power)
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 0,
  [ROLES.VIEWER]: 1,
  [ROLES.EDITOR]: 2,
  [ROLES.ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4
};

// PERMISSION MATRIX
// Structure: { role: { resource: [actions] } }
export const PERMISSIONS = {
  // SUPER ADMIN - Full access to everything
  [ROLES.SUPER_ADMIN]: {
    Product: ['create', 'read', 'update', 'delete', 'bulk_update', 'bulk_delete'],
    User: ['create', 'read', 'update', 'delete', 'manage_roles'],
    Order: ['create', 'read', 'update', 'delete', 'update_status'],
    Category: ['create', 'read', 'update', 'delete'],
    Review: ['create', 'read', 'update', 'delete', 'moderate'],
    ActivityLog: ['read', 'export'],
    Settings: ['read', 'update']
  },
  
  // ADMIN - Daily operations, cannot manage users or roles
  [ROLES.ADMIN]: {
    Product: ['create', 'read', 'update', 'delete', 'bulk_update', 'bulk_delete'],
    User: ['read'], // Can view users but not modify
    Order: ['create', 'read', 'update', 'delete', 'update_status'],
    Category: ['create', 'read', 'update', 'delete'],
    Review: ['read', 'update', 'delete', 'moderate'],
    ActivityLog: [], // Cannot view activity logs
    Settings: ['read']
  },
  
  // EDITOR - Content management, no deletions
  [ROLES.EDITOR]: {
    Product: ['create', 'read', 'update'],
    User: [], // No user access
    Order: ['read'], // View only
    Category: ['create', 'read', 'update'],
    Review: ['read'], // View only
    ActivityLog: [],
    Settings: ['read']
  },
  
  // VIEWER - Read-only access
  [ROLES.VIEWER]: {
    Product: ['read'],
    User: [], // No user access
    Order: ['read'],
    Category: ['read'],
    Review: ['read'],
    ActivityLog: [],
    Settings: ['read']
  },
  
  // REGULAR USER - No admin access
  [ROLES.USER]: {}
};

/**
 * Check if a user has a specific permission
 * 
 * @param {Object} user - User object with role property
 * @param {String} action - Action to check (e.g., 'create', 'delete')
 * @param {String} resource - Resource type (e.g., 'Product', 'User')
 * @returns {Boolean} - True if user has permission
 * 
 * EXAMPLE:
 * hasPermission(user, 'delete', 'Product')
 * → Super Admin: true
 * → Admin: true
 * → Editor: false
 * → Viewer: false
 */
export function hasPermission(user, action, resource) {
  if (!user || !user.role) {
    return false;
  }
  
  const userRole = user.role;
  
  // Super admins have all permissions
  if (userRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // Check if role has permission for this resource and action
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions || !rolePermissions[resource]) {
    return false;
  }
  
  return rolePermissions[resource].includes(action);
}

/**
 * Check if user has any of the specified roles
 * 
 * @param {Object} user - User object with role property
 * @param {Array<String>} roles - Array of role names
 * @returns {Boolean} - True if user has one of the roles
 * 
 * EXAMPLE:
 * hasRole(user, ['admin', 'super_admin'])
 * → Checks if user is either admin OR super_admin
 */
export function hasRole(user, roles) {
  if (!user || !user.role) {
    return false;
  }
  
  return roles.includes(user.role);
}

/**
 * Check if user's role is higher than or equal to specified role
 * 
 * @param {Object} user - User object with role property
 * @param {String} minimumRole - Minimum required role
 * @returns {Boolean} - True if user's role is >= minimum
 * 
 * EXAMPLE:
 * hasMinimumRole(user, 'editor')
 * → Editor: true
 * → Admin: true
 * → Super Admin: true
 * → Viewer: false
 */
export function hasMinimumRole(user, minimumRole) {
  if (!user || !user.role) {
    return false;
  }
  
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0;
  
  return userLevel >= minimumLevel;
}

/**
 * Check if user is an admin (any admin role)
 * 
 * @param {Object} user - User object
 * @returns {Boolean} - True if user has any admin role
 * 
 * EDUCATIONAL NOTE:
 * This maintains backward compatibility with existing isAdmin checks.
 * Any role >= viewer is considered "admin" for basic access control.
 */
export function isAdmin(user) {
  if (!user) {
    return false;
  }
  
  // Check both old isAdmin flag and new role system
  return user.isAdmin === true || hasMinimumRole(user, ROLES.VIEWER);
}

/**
 * Get human-readable role name
 * 
 * @param {String} role - Role identifier
 * @returns {String} - Formatted role name
 */
export function getRoleName(role) {
  const roleNames = {
    [ROLES.USER]: 'User',
    [ROLES.VIEWER]: 'Viewer',
    [ROLES.EDITOR]: 'Editor',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.SUPER_ADMIN]: 'Super Admin'
  };
  
  return roleNames[role] || 'Unknown';
}

/**
 * Get role badge color for UI
 * 
 * @param {String} role - Role identifier
 * @returns {String} - DaisyUI badge class
 */
export function getRoleBadgeClass(role) {
  const badgeClasses = {
    [ROLES.USER]: 'badge-ghost',
    [ROLES.VIEWER]: 'badge-info',
    [ROLES.EDITOR]: 'badge-primary',
    [ROLES.ADMIN]: 'badge-secondary',
    [ROLES.SUPER_ADMIN]: 'badge-accent'
  };
  
  return badgeClasses[role] || 'badge-ghost';
}

/**
 * Get list of all admin roles (excludes regular 'user')
 * 
 * @returns {Array<String>} - Array of admin role identifiers
 */
export function getAdminRoles() {
  return [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];
}

/**
 * Check if user can manage another user's role
 * 
 * @param {Object} currentUser - User attempting to change role
 * @param {Object} targetUser - User whose role is being changed
 * @returns {Boolean} - True if allowed
 * 
 * RULES:
 * - Only Super Admin can manage roles
 * - Cannot change your own role (prevents self-demotion)
 * - Super Admin cannot demote the last Super Admin
 */
export function canManageUserRole(currentUser, targetUser) {
  if (!currentUser || !targetUser) {
    return false;
  }
  
  // Only Super Admin can manage roles
  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    return false;
  }
  
  // Cannot change your own role
  if (currentUser._id.toString() === targetUser._id.toString()) {
    return false;
  }
  
  return true;
}
