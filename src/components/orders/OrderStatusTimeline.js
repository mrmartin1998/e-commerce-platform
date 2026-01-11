/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER STATUS TIMELINE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * WHAT THIS COMPONENT DOES:
 * Displays a visual timeline of an order's status progression from creation
 * to delivery. Shows customers exactly where their order is in the fulfillment
 * process with timestamps, status icons, and optional notes.
 * 
 * EXAMPLE USE CASE:
 * Customer views their order → Sees timeline showing:
 * - Order was created on Jan 11 at 10:00 AM
 * - Payment processed on Jan 11 at 10:30 AM
 * - Shipped on Jan 11 at 2:00 PM via UPS
 * - Expected delivery on Jan 15
 * 
 * PROPS:
 * @param {Array} statusHistory - Array of status change objects from Order model
 *   Example: [{ status: 'pending', timestamp: Date, updatedBy: userId, note: 'Order created' }]
 * @param {String} currentStatus - Current order status (for highlighting)
 * @param {Date} estimatedDelivery - Expected delivery date (optional)
 * @param {Boolean} showAdminInfo - Whether to show who made each change (admin view)
 * 
 * LEARNING POINTS:
 * 1. Component composition - Building reusable UI pieces
 * 2. Conditional rendering - Different views based on props
 * 3. Date formatting - Making timestamps human-readable
 * 4. DaisyUI styling - Using pre-built component classes
 * 5. Responsive design - Mobile-friendly timeline
 */

'use client';

import { useMemo } from 'react';

/**
 * STATUS CONFIGURATION
 * ====================
 * 
 * WHY USE A CONFIG OBJECT?
 * Instead of hardcoding icons and colors throughout the component,
 * we centralize all status-related data in one place. This makes it:
 * - Easy to update (change icon in one place, not 10)
 * - Consistent across the app
 * - Easy to add new statuses
 * 
 * STRUCTURE:
 * Each status has:
 * - label: User-friendly display name
 * - icon: Emoji or icon to display
 * - color: DaisyUI color class for styling
 * - description: Default message when no note provided
 */
const STATUS_CONFIG = {
  pending: {
    label: 'Order Placed',
    icon: '📝',
    color: 'warning',  // Yellow in DaisyUI
    description: 'Your order has been received and is awaiting processing'
  },
  processing: {
    label: 'Processing',
    icon: '⚙️',
    color: 'info',  // Blue in DaisyUI
    description: 'Your payment has been confirmed and order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    icon: '📦',
    color: 'primary',  // Purple in DaisyUI
    description: 'Your order is on its way'
  },
  delivered: {
    label: 'Delivered',
    icon: '✅',
    color: 'success',  // Green in DaisyUI
    description: 'Your order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    icon: '❌',
    color: 'error',  // Red in DaisyUI
    description: 'This order has been cancelled'
  }
};

/**
 * HELPER FUNCTION: Format Date to Human-Readable String
 * ======================================================
 * 
 * WHY THIS EXISTS:
 * JavaScript Date objects are hard to read: "2026-01-11T10:00:00.000Z"
 * Users want: "January 11, 2026 at 10:00 AM"
 * 
 * HOW IT WORKS:
 * Uses Intl.DateTimeFormat API (built into JavaScript) to format dates
 * based on user's locale (language/region settings)
 * 
 * EXAMPLE:
 * formatDate(new Date()) → "January 11, 2026 at 10:30 AM"
 */
function formatDate(date) {
  if (!date) return 'N/A';
  
  // Create a date formatter with specific options
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',      // Full month name (January, not Jan)
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true        // Use AM/PM format
  }).format(new Date(date));
}

/**
 * HELPER FUNCTION: Get Relative Time
 * ===================================
 * 
 * WHY THIS EXISTS:
 * Sometimes "2 hours ago" is more useful than "January 11, 2026 at 10:00 AM"
 * 
 * HOW IT WORKS:
 * Calculate difference between now and the timestamp, then format as
 * "X days/hours/minutes ago"
 * 
 * EXAMPLE:
 * getRelativeTime(twoHoursAgo) → "2 hours ago"
 */
function getRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export default function OrderStatusTimeline({ 
  statusHistory = [], 
  currentStatus = 'pending',
  estimatedDelivery,
  showAdminInfo = false 
}) {
  /**
   * USEMEMO HOOK - PERFORMANCE OPTIMIZATION
   * ========================================
   * 
   * WHAT IS USEMEMO?
   * useMemo is a React hook that "memoizes" (remembers) a calculated value.
   * It only recalculates when dependencies change.
   * 
   * WHY USE IT HERE?
   * Sorting and processing statusHistory can be expensive if the array is large.
   * We don't want to do this on every render - only when statusHistory changes.
   * 
   * HOW IT WORKS:
   * 1. First render: Calculate sortedHistory
   * 2. Next renders: If statusHistory hasn't changed, use cached sortedHistory
   * 3. If statusHistory changes: Recalculate
   * 
   * DEPENDENCIES: [statusHistory] - Recalculate only when this changes
   */
  const sortedHistory = useMemo(() => {
    if (!statusHistory || statusHistory.length === 0) {
      // No history? Create a default entry for current status
      return [{
        status: currentStatus,
        timestamp: new Date(),
        note: STATUS_CONFIG[currentStatus]?.description || 'No additional information'
      }];
    }
    
    // Sort by timestamp (oldest first) for chronological order
    return [...statusHistory].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [statusHistory, currentStatus]);

  /**
   * DETERMINE ALL POSSIBLE STATUSES
   * ================================
   * 
   * WHY THIS EXISTS:
   * We want to show the FULL journey, not just completed steps.
   * 
   * EXAMPLE:
   * If order is "shipped", show:
   * ✅ Pending (completed)
   * ✅ Processing (completed)
   * ✅ Shipped (current)
   * ⏳ Delivered (future)
   * 
   * HOW IT WORKS:
   * Define the standard order flow, then mark which steps are complete
   */
  const statusFlow = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statusFlow.indexOf(currentStatus);

  return (
    <div className="w-full">
      {/**
       * TIMELINE HEADER
       * ===============
       * Shows title and optional estimated delivery
       */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Order Tracking</h3>
        {estimatedDelivery && currentStatus !== 'delivered' && (
          <div className="text-sm">
            <span className="opacity-70">Estimated Delivery: </span>
            <span className="font-semibold">
              {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      {/**
       * TIMELINE CONTAINER
       * ==================
       * 
       * DAISYUI CLASSES EXPLAINED:
       * - space-y-6: Add vertical spacing between timeline items
       */}
      <div className="space-y-6">
        {sortedHistory.map((entry, index) => {
          const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
          const isCurrentStatus = entry.status === currentStatus;
          const isCompleted = statusFlow.indexOf(entry.status) <= currentStatusIndex;
          
          return (
            <div key={index} className="relative pl-8">
              {/**
               * TIMELINE LINE (Vertical connector between items)
               * =================================================
               * 
               * POSITIONING:
               * - absolute: Position relative to parent
               * - left-[7px]: Align with icon center
               * - top-8: Start below the icon
               * - h-full: Extend to next item
               * 
               * CONDITIONAL RENDERING:
               * Only show line if not the last item
               */}
              {index < sortedHistory.length - 1 && (
                <div 
                  className={`absolute left-[7px] top-8 w-0.5 h-full ${
                    isCompleted ? 'bg-primary' : 'bg-base-300'
                  }`}
                />
              )}
              
              {/**
               * STATUS ICON (Circle with emoji/icon)
               * ====================================
               * 
               * STRUCTURE:
               * - Outer div: Colored circle background
               * - Inner span: Icon/emoji centered
               * 
               * CONDITIONAL STYLING:
               * - isCurrentStatus: Pulse animation + primary color
               * - isCompleted: Success color
               * - Otherwise: Neutral color
               */}
              <div className="flex items-start gap-4">
                <div 
                  className={`
                    absolute left-0 w-4 h-4 rounded-full flex items-center justify-center
                    ${isCurrentStatus ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : ''}
                    ${!isCurrentStatus && isCompleted ? 'bg-success' : ''}
                    ${!isCurrentStatus && !isCompleted ? 'bg-base-300' : ''}
                  `}
                >
                  <span className="text-xs">{config.icon}</span>
                </div>
                
                {/**
                 * STATUS CONTENT
                 * ==============
                 * Shows status label, timestamp, note, and optional admin info
                 */}
                <div className="flex-1">
                  {/* Status Label */}
                  <h4 className={`font-semibold ${isCurrentStatus ? 'text-primary text-lg' : ''}`}>
                    {config.label}
                  </h4>
                  
                  {/* Timestamp */}
                  <p className="text-sm opacity-70 mt-1">
                    {formatDate(entry.timestamp)}
                    {entry.timestamp && (
                      <span className="ml-2 text-xs">
                        ({getRelativeTime(entry.timestamp)})
                      </span>
                    )}
                  </p>
                  
                  {/* Note/Description */}
                  {entry.note && (
                    <p className="text-sm mt-2 italic opacity-80">
                      {entry.note}
                    </p>
                  )}
                  
                  {/* Admin Info (only shown if showAdminInfo is true) */}
                  {showAdminInfo && entry.updatedBy && (
                    <p className="text-xs mt-1 opacity-60">
                      Updated by: {entry.updatedBy.name || entry.updatedBy.email || 'Admin'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/**
       * FUTURE STATUS PREVIEW (Optional)
       * =================================
       * 
       * WHY THIS EXISTS:
       * Show customers what's coming next in the order journey
       * 
       * CONDITIONAL RENDERING:
       * Only show if order isn't delivered or cancelled
       */}
      {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
        <div className="mt-8 p-4 bg-base-200 rounded-lg">
          <h4 className="font-semibold mb-2">Next Steps</h4>
          <div className="text-sm opacity-70">
            {currentStatus === 'pending' && 'Your order will be processed once payment is confirmed.'}
            {currentStatus === 'processing' && 'Your order is being prepared for shipment.'}
            {currentStatus === 'shipped' && 'Your order is on its way! Track it with the provided tracking number.'}
          </div>
        </div>
      )}
    </div>
  );
}
