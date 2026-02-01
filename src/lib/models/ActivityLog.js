import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * ACTIVITY LOG MODEL
 * ===================
 * 
 * PURPOSE:
 * Tracks all admin actions for security, auditing, and compliance.
 * Provides complete audit trail of who did what, when, and why.
 * 
 * USE CASES:
 * - Security: Identify unauthorized access attempts
 * - Compliance: Regulatory requirements for data changes
 * - Debugging: Track down who made problematic changes
 * - Analytics: Understand admin usage patterns
 * 
 * EXAMPLE ENTRIES:
 * - "Admin John deleted 5 products at 2:00 PM"
 * - "Super Admin Sarah changed User #123's role from Editor to Admin"
 * - "Editor Mike updated Product #456's price from $99 to $149"
 */

const activityLogSchema = new Schema({
  // WHO performed the action
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // WHAT action was performed
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',        // Created new resource
      'UPDATE',        // Modified existing resource
      'DELETE',        // Deleted resource
      'BULK_DELETE',   // Bulk deletion
      'BULK_UPDATE',   // Bulk update
      'VIEW',          // Viewed sensitive data
      'LOGIN',         // Admin login
      'LOGOUT',        // Admin logout
      'ROLE_CHANGE',   // Changed user role
      'STATUS_CHANGE', // Changed order/product status
      'EXPORT'         // Exported data
    ],
    index: true
  },
  
  // WHICH resource was affected
  resource: {
    type: String,
    required: true,
    enum: [
      'Product',
      'User',
      'Order',
      'Category',
      'Review',
      'ActivityLog',
      'Settings'
    ],
    index: true
  },
  
  // The ID of the affected resource (if applicable)
  resourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  
  // DETAILS about the action (what changed)
  details: {
    type: Schema.Types.Mixed,
    default: {}
    // Examples:
    // { oldValue: 'draft', newValue: 'published' }
    // { count: 5, productIds: [...] }
    // { oldRole: 'editor', newRole: 'admin' }
  },
  
  // METADATA for security tracking
  metadata: {
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    // Additional context
    note: String
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// INDEXES for efficient querying
activityLogSchema.index({ createdAt: -1 }); // Most recent first
activityLogSchema.index({ userId: 1, createdAt: -1 }); // User's activity
activityLogSchema.index({ resource: 1, action: 1 }); // Filter by resource and action

// Auto-cleanup: Delete logs older than 6 months
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // 180 days

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
