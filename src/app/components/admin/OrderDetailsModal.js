/**
 * OrderDetailsModal Component
 * 
 * Displays comprehensive order information in a modal dialog.
 * Shows customer info, items, totals, and status history.
 * 
 * Updated to display status history timeline for admins to see
 * who made changes, when they were made, and why.
 */

export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Order Details</h3>
        
        {/* Customer Information */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Customer Information</h4>
          <p>Name: {order.userId?.name}</p>
          <p>Email: {order.userId?.email}</p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Items</h4>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center gap-2">
                        {item.productId?.images?.[0] && (
                          <img 
                            src={item.productId.images[0]} 
                            alt={item.productId.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <span>{item.productId?.name || 'Product Not Found'}</span>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>${item.price?.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Order Summary</h4>
          <p>Subtotal: ${order.subtotal?.toFixed(2)}</p>
          <p>Tax: ${order.tax?.toFixed(2)}</p>
          <p className="font-bold">Total: ${order.total?.toFixed(2)}</p>
        </div>

        {/* Status */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Status</h4>
          <p>Payment Status: {order.paymentStatus}</p>
          <p>Order Status: {order.status}</p>
          <p>Order Date: {new Date(order.paidAt || order.createdAt).toLocaleString()}</p>
          
          {/* Tracking Information */}
          {order.trackingUrl && (
            <div className="mt-3 p-3 bg-base-200 rounded">
              <p className="font-semibold mb-1">Shipping Information</p>
              {order.carrier && <p className="text-sm">Carrier: {order.carrier}</p>}
              <p className="text-sm">
                Tracking: <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="link link-primary">
                  View Tracking
                </a>
              </p>
              {order.estimatedDelivery && (
                <p className="text-sm">
                  Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Status History</h4>
            <div className="space-y-3">
              {/* Sort history chronologically (oldest first) */}
              {[...order.statusHistory]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((entry, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold capitalize">{entry.status}</p>
                      {entry.note && <p className="text-sm text-base-content/70">{entry.note}</p>}
                    </div>
                    <span className="badge badge-outline badge-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.updatedBy && (
                    <p className="text-xs text-base-content/60 mt-1">
                      Updated by: {entry.updatedBy.name || entry.updatedBy.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} 