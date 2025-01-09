import Image from 'next/image';
import Link from 'next/link';

export default function ProductListItem({ product }) {
  const mainImage = product.images?.[0]?.url || '/images/placeholder.png';
  
  return (
    <div className="card card-side bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="relative w-48">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-gray-500">{product.description}</p>
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