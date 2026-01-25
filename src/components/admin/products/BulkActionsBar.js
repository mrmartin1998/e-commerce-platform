'use client';

/**
 * BulkActionsBar Component
 * 
 * Sticky bar that appears when products are selected.
 * Provides bulk operation buttons: Delete, Change Status, Change Category
 */
export default function BulkActionsBar({ 
  selectedCount, 
  onDelete, 
  onChangeStatus, 
  onChangeCategory, 
  onDeselectAll,
  loading = false 
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-200 border-t border-base-300 shadow-lg">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Selected Count */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onChangeStatus}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Change Status
            </button>

            <button
              onClick={onChangeCategory}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              Change Category
            </button>

            <button
              onClick={onDelete}
              className="btn btn-error btn-sm"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>

            <button
              onClick={onDeselectAll}
              className="btn btn-ghost btn-sm"
              disabled={loading}
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
