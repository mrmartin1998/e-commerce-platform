import connectDB from '@/lib/db/mongoose';
import ActivityLog from '@/lib/models/ActivityLog';

/**
 * ACTIVITY LOGGER UTILITY
 * ========================
 * 
 * PURPOSE:
 * Centralized utility for logging admin actions to database.
 * Provides audit trail for security, compliance, and debugging.
 * 
 * USAGE:
 * Import this in any API route where you need to log an action:
 * 
 * import { logActivity } from '@/lib/utils/activityLogger';
 * 
 * await logActivity({
 *   userId: request.user._id,
 *   action: 'DELETE',
 *   resource: 'Product',
 *   resourceId: productId,
 *   details: { name: product.name }
 * });
 */

/**
 * Log an admin activity to the database
 * 
 * @param {Object} params - Activity details
 * @param {String} params.userId - ID of user performing action
 * @param {String} params.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {String} params.resource - Resource type (Product, User, Order, etc.)
 * @param {String} params.resourceId - (Optional) ID of the affected resource
 * @param {Object} params.details - (Optional) Additional details about the action
 * @param {Object} params.metadata - (Optional) IP address, user agent, notes
 * @param {Object} params.request - (Optional) Next.js request object to extract metadata
 * 
 * @returns {Promise<Object>} - Created activity log document
 * 
 * EXAMPLE:
 * await logActivity({
 *   userId: user._id,
 *   action: 'BULK_DELETE',
 *   resource: 'Product',
 *   details: { count: 5, productIds: [...] },
 *   request: request // Automatically extracts IP and user agent
 * });
 */
export async function logActivity({
  userId,
  action,
  resource,
  resourceId = null,
  details = {},
  metadata = {},
  request = null
}) {
  try {
    // Ensure database connection
    await connectDB();
    
    // Extract metadata from request if provided
    let activityMetadata = { ...metadata };
    
    if (request) {
      // Extract IP address
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      // Extract user agent
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      activityMetadata = {
        ...activityMetadata,
        ipAddress: ip,
        userAgent: userAgent
      };
    }
    
    // Create activity log entry
    const activityLog = await ActivityLog.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      metadata: activityMetadata
    });
    
    return activityLog;
  } catch (error) {
    // Don't throw - logging failures shouldn't break the main operation
    // Just log the error and continue
    console.error('Failed to log activity:', error);
    return null;
  }
}

/**
 * Log bulk operation activity
 * 
 * @param {Object} params - Bulk operation details
 * @param {String} params.userId - ID of user performing action
 * @param {String} params.action - BULK_UPDATE or BULK_DELETE
 * @param {String} params.resource - Resource type
 * @param {Array} params.resourceIds - Array of affected resource IDs
 * @param {Object} params.details - Operation details
 * @param {Object} params.request - (Optional) Request object
 * 
 * @returns {Promise<Object>} - Created activity log
 * 
 * EXAMPLE:
 * await logBulkActivity({
 *   userId: user._id,
 *   action: 'BULK_DELETE',
 *   resource: 'Product',
 *   resourceIds: ['id1', 'id2', 'id3'],
 *   details: { count: 3 },
 *   request: request
 * });
 */
export async function logBulkActivity({
  userId,
  action,
  resource,
  resourceIds = [],
  details = {},
  request = null
}) {
  return logActivity({
    userId,
    action,
    resource,
    details: {
      ...details,
      count: resourceIds.length,
      resourceIds: resourceIds
    },
    request
  });
}

/**
 * Log role change activity
 * 
 * @param {Object} params - Role change details
 * @param {String} params.adminUserId - ID of admin changing the role
 * @param {String} params.targetUserId - ID of user whose role is being changed
 * @param {String} params.oldRole - Previous role
 * @param {String} params.newRole - New role
 * @param {String} params.reason - (Optional) Reason for change
 * @param {Object} params.request - (Optional) Request object
 * 
 * @returns {Promise<Object>} - Created activity log
 */
export async function logRoleChange({
  adminUserId,
  targetUserId,
  oldRole,
  newRole,
  reason = null,
  request = null
}) {
  return logActivity({
    userId: adminUserId,
    action: 'ROLE_CHANGE',
    resource: 'User',
    resourceId: targetUserId,
    details: {
      oldRole,
      newRole,
      reason
    },
    metadata: {
      note: reason
    },
    request
  });
}

/**
 * Log status change activity (orders, products, etc.)
 * 
 * @param {Object} params - Status change details
 * @param {String} params.userId - ID of user performing action
 * @param {String} params.resource - Resource type
 * @param {String} params.resourceId - ID of resource
 * @param {String} params.oldStatus - Previous status
 * @param {String} params.newStatus - New status
 * @param {String} params.note - (Optional) Note about the change
 * @param {Object} params.request - (Optional) Request object
 * 
 * @returns {Promise<Object>} - Created activity log
 */
export async function logStatusChange({
  userId,
  resource,
  resourceId,
  oldStatus,
  newStatus,
  note = null,
  request = null
}) {
  return logActivity({
    userId,
    action: 'STATUS_CHANGE',
    resource,
    resourceId,
    details: {
      oldStatus,
      newStatus
    },
    metadata: {
      note
    },
    request
  });
}

/**
 * Log data export activity
 * 
 * @param {Object} params - Export details
 * @param {String} params.userId - ID of user performing export
 * @param {String} params.resource - What data was exported
 * @param {String} params.format - Export format (CSV, PDF, etc.)
 * @param {Number} params.recordCount - Number of records exported
 * @param {Object} params.filters - Any filters applied
 * @param {Object} params.request - (Optional) Request object
 * 
 * @returns {Promise<Object>} - Created activity log
 */
export async function logExport({
  userId,
  resource,
  format = 'CSV',
  recordCount = 0,
  filters = {},
  request = null
}) {
  return logActivity({
    userId,
    action: 'EXPORT',
    resource,
    details: {
      format,
      recordCount,
      filters
    },
    request
  });
}

/**
 * Get recent activity for a user
 * 
 * @param {String} userId - User ID to fetch activity for
 * @param {Number} limit - Max number of records (default 50)
 * @returns {Promise<Array>} - Array of activity log documents
 */
export async function getUserActivity(userId, limit = 50) {
  try {
    await connectDB();
    
    const activities = await ActivityLog
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return activities;
  } catch (error) {
    console.error('Failed to fetch user activity:', error);
    return [];
  }
}

/**
 * Get recent activity for a specific resource
 * 
 * @param {String} resource - Resource type
 * @param {String} resourceId - (Optional) Specific resource ID
 * @param {Number} limit - Max number of records (default 50)
 * @returns {Promise<Array>} - Array of activity log documents
 */
export async function getResourceActivity(resource, resourceId = null, limit = 50) {
  try {
    await connectDB();
    
    const query = { resource };
    if (resourceId) {
      query.resourceId = resourceId;
    }
    
    const activities = await ActivityLog
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .lean();
    
    return activities;
  } catch (error) {
    console.error('Failed to fetch resource activity:', error);
    return [];
  }
}
