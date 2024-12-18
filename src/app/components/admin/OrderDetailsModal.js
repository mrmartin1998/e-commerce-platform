export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
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
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} 