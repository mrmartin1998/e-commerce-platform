'use client';

/**
 * BulkDeleteModal Component
 * 
 * Confirmation modal for bulk delete operation.
 * Shows warning and lists products to be deleted.
 */
export default function BulkDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  products = [],
  loading = false 
}) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Delete Products</h3>
        
        {/* Warning Alert */}
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This action cannot be undone!</span>
        </div>

        <p className="mb-4">
          Are you sure you want to delete <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}?
        </p>

        {/* Product List */}
        {products.length > 0 && products.length <= 10 && (
          <div className="bg-base-200 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
            <ul className="list-disc list-inside text-sm">
              {products.map((product) => (
                <li key={product._id} className="truncate">
                  {product.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {products.length > 10 && (
          <p className="text-sm text-base-content/70 mb-4">
            Showing first 10 of {products.length} products...
          </p>
        )}

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
            onClick={onConfirm}
            className={`btn btn-error ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
