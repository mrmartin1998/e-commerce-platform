import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: '/images/placeholder.png' }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow group">
      <figure className="relative h-48 overflow-hidden">
        <Image
          src={productImages[currentImageIndex].url}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Multiple Images Navigation */}
        {productImages.length > 1 && (
          <>
            {/* Image Navigation Buttons - only show on hover */}
            <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70 ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  prevImage();
                }}
              >
                ❮
              </button>
              <button
                className="btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70 mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  nextImage();
                }}
              >
                ❯
              </button>
            </div>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {productImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Image Counter */}
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {productImages.length} 📷
            </div>
          </>
        )}
      </figure>
      
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold">${product.price}</span>
          <Link href={`/products/${product._id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}