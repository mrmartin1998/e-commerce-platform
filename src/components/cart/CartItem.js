import Image from 'next/image';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-base-200">
      {/* Product Image */}
      <div className="w-16 h-16 relative flex-shrink-0">
        <Image
          src={item.image || '/images/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
      </div>
      
      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.name}</h3>
        <p className="text-sm text-base-content/70">${item.price}</p>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
          className="btn btn-sm btn-circle btn-outline"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          className="btn btn-sm btn-circle btn-outline"
        >
          +
        </button>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.productId)}
        className="btn btn-sm btn-error btn-circle"
      >
        ✕
      </button>
    </div>
  );
}
