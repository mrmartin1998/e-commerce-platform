import Image from 'next/image';
import Link from 'next/link';

export default function ProductListItem({ product }) {
  const mainImage = product.images?.[0]?.url || '/images/placeholder.png';
  
  return (
    <div className="card card-side bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="relative w-32 sm:w-48 shrink-0">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 128px, 192px"
        />
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