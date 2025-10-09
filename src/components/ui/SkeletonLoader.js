"use client";

// Product Card Skeleton for grid view
export function ProductCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="skeleton h-48 w-full"></figure>
      <div className="card-body">
        <div className="skeleton h-6 w-3/4 mb-2"></div>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-2/3 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="skeleton h-6 w-16"></div>
          <div className="skeleton h-10 w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Product List Item Skeleton
export function ProductListSkeleton() {
  return (
    <div className="card card-side bg-base-100 shadow-xl">
      <figure className="skeleton w-32 h-32"></figure>
      <div className="card-body">
        <div className="skeleton h-6 w-1/2 mb-2"></div>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-3/4 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="skeleton h-6 w-20"></div>
          <div className="skeleton h-10 w-28"></div>
        </div>
      </div>
    </div>
  );
}

// Admin Stats Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="stat bg-base-100 shadow">
      <div className="skeleton h-4 w-20 mb-2"></div>
      <div className="skeleton h-8 w-16"></div>
    </div>
  );
}

// Admin Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <div className="skeleton h-4 w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="skeleton h-4 w-24"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 items-center p-4">
      <div className="skeleton w-16 h-16 rounded"></div>
      <div className="flex-1">
        <div className="skeleton h-4 w-32 mb-2"></div>
        <div className="skeleton h-3 w-16 mb-2"></div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-6"></div>
          <div className="skeleton h-4 w-8"></div>
          <div className="skeleton h-6 w-6"></div>
        </div>
      </div>
      <div className="skeleton h-6 w-6"></div>
    </div>
  );
}

// Generic Loading Spinner
export function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const sizeClasses = {
    xs: "loading-xs",
    sm: "loading-sm", 
    md: "loading-md",
    lg: "loading-lg",
    xl: "loading-xl"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
      {text && <p className="mt-4 text-base-content/70">{text}</p>}
    </div>
  );
}

// Error State Component
export function ErrorState({ 
  title = "Something went wrong", 
  message = "Please try again later",
  onRetry = null 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-error text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-error mb-2">{title}</h3>
      <p className="text-base-content/70 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline btn-error">
          Try Again
        </button>
      )}
    </div>
  );
}

// Empty State Component
export function EmptyState({ 
  icon = "📭", 
  title = "No items found", 
  message = "There are no items to display",
  actionText = null,
  onAction = null 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-base-content/70 mb-6">{message}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
}
