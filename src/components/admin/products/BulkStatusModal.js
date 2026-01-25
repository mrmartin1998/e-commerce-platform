'use client';

import { useState } from 'react';

/**
 * BulkStatusModal Component
 * 
 * Modal for bulk status update operation.
 * Allows selection of new status (draft/published).
 */
export default function BulkStatusModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productCount = 0,
  loading = false 
}) {
  const [selectedStatus, setSelectedStatus] = useState('published');

  if (!isOpen) return null;

  function handleConfirm() {
    onConfirm(selectedStatus);
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Change Product Status</h3>
        
        <p className="mb-4">
          Update status for <strong>{productCount}</strong> product{productCount !== 1 ? 's' : ''}
        </p>

        {/* Status Selection */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold">New Status</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={loading}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <label className="label">
            <span className="label-text-alt">
              {selectedStatus === 'published' ? 'Products will be visible to customers' : 'Products will be hidden from customers'}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button 
            onClick={onClose} 
            className="btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
