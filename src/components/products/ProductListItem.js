import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductListItem({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMjAwIiBzdHlsZT0iZmlsbDojOWNhM2FmO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjI1cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+' }];

  return (
    <div className="card card-side bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="relative w-32 sm:w-48 shrink-0 group">
        <Image
          src={productImages[currentImageIndex].url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 128px, 192px"
        />
        
        {/* Multiple Images Indicator and Navigation */}
        {productImages.length > 1 && (
          <>
            {/* Touch/Click Navigation for Mobile */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(prev => 
                  prev === productImages.length - 1 ? 0 : prev + 1
                );
              }}
            />
            
            {/* Image Counter */}
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1}/{productImages.length}
            </div>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {productImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </figure>
      
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="card-title text-lg sm:text-xl">{product.name}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-3">
              {product.description}
            </p>
          </div>
          <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-end gap-4">
            <span className="text-lg sm:text-xl font-bold">${product.price}</span>
            <Link 
              href={`/products/${product._id}`} 
              className="btn btn-primary btn-sm sm:btn-md"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}