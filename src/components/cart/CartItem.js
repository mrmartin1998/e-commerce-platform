import Image from 'next/image';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex gap-4 p-4 border-b border-base-200">
      {/* Product Image */}
      <div className="w-20 h-20 md:w-24 md:h-24 relative flex-shrink-0">
        <Image
          src={item.image || '/images/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 80px, 96px"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
      </div>
      
      {/* Product Details & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Product Name & Price */}
        <div>
          <h3 className="font-medium truncate">{item.name}</h3>
          <p className="text-sm text-base-content/70">${item.price}</p>
        </div>
        
        {/* Quantity Controls & Remove Button */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="btn btn-sm btn-circle btn-outline min-w-[44px] min-h-[44px]"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="btn btn-sm btn-circle btn-outline min-w-[44px] min-h-[44px]"
            >
              +
            </button>
          </div>
          
          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.productId)}
            className="btn btn-sm btn-error btn-circle min-w-[44px] min-h-[44px]"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
