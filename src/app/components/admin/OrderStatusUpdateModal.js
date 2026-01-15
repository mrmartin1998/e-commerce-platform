/**
 * OrderStatusUpdateModal Component
 * 
 * A confirmation modal for updating order status in the admin panel.
 * This component provides a safe way to update order status by requiring
 * explicit confirmation and optional notes, preventing accidental changes.
 * 
 * Features:
 * - Status selection dropdown with validation
 * - Optional note field for documenting the change
 * - Tracking information fields (URL, carrier, estimated delivery)
 * - Cancel/Confirm buttons with clear actions
 * - Loading state during API call
 * - Error handling with user feedback
 * 
 * Why This Component Matters:
 * - Prevents accidental status changes (no more inline dropdowns)
 * - Encourages documentation (admins can explain why they made the change)
 * - Captures tracking details when shipping orders
 * - Improves accountability and audit trail
 * 
 * @param {Object} order - The order being updated
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback when modal is closed
 * @param {Function} onUpdate - Callback when order is successfully updated
 */

'use client';

import { useState } from 'react';

export default function OrderStatusUpdateModal({ order, isOpen, onClose, onUpdate }) {
  // Local state for form inputs
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Don't render if modal is closed or no order is selected
  if (!isOpen || !order) return null;

  /**
   * Reset form to initial state
   * Called when modal opens or after successful update
   */
  const resetForm = () => {
    setNewStatus(order.status || 'pending');
    setNote('');
    setTrackingUrl(order.trackingUrl || '');
    setCarrier(order.carrier || '');
    setEstimatedDelivery(order.estimatedDelivery ? 
      new Date(order.estimatedDelivery).toISOString().split('T')[0] : '');
    setError(null);
  };

  /**
   * Handle modal close
   * Resets form and calls parent's onClose callback
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Handle form submission
   * Validates input, calls API, and updates parent component
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate status is selected
    if (!newStatus) {
      setError('Please select a status');
      return;
    }

    // Don't allow update if status hasn't changed and no tracking info added
    if (newStatus === order.status && !note && !trackingUrl && !carrier && !estimatedDelivery) {
      setError('No changes to save. Please update status or add tracking information.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build request body with only the fields that have values
      const body = { status: newStatus };
      if (note) body.note = note;
      if (trackingUrl) body.trackingUrl = trackingUrl;
      if (carrier) body.carrier = carrier;
      if (estimatedDelivery) body.estimatedDelivery = estimatedDelivery;

      // Call the API endpoint we enhanced in Task 3
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      // Handle API errors (validation, not found, etc.)
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Success! Call parent's onUpdate callback with the updated order
      onUpdate(data);
      
      // Close modal and reset form
      handleClose();
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize form when order changes
  // This ensures form has current order data when modal opens
  if (newStatus === '' && order) {
    resetForm();
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Update Order Status</h3>
        
        {/* Current Order Info */}
        <div className="bg-base-200 p-4 rounded-lg mb-6">
          <p className="text-sm"><strong>Order ID:</strong> {order._id}</p>
          <p className="text-sm"><strong>Customer:</strong> {order.userId?.email || 'N/A'}</p>
          <p className="text-sm">
            <strong>Current Status:</strong>{' '}
            <span className="badge badge-primary">{order.status || 'pending'}</span>
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleSubmit}>
          {/* Status Selection */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">New Status *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              disabled={loading}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <label className="label">
              <span className="label-text-alt">
                Select the new order status
              </span>
            </label>
          </div>

          {/* Note Field */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">Note (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Add a note explaining this status change (e.g., 'Package picked up by UPS driver')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt">
                This note will be saved in the order history for audit purposes
              </span>
            </label>
          </div>

          {/* Tracking Information - Show only when status is 'shipped' */}
          {newStatus === 'shipped' && (
            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-3">Shipping Information</h4>
              
              {/* Carrier Selection */}
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Carrier</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select carrier...</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tracking URL */}
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Tracking URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full"
                  placeholder="https://www.ups.com/track?tracknum=..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Estimated Delivery Date */}
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Estimated Delivery Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
