"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AddToCartButton from '@/components/products/AddToCartButton';

async function getProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      getProduct(params.id)
        .then(data => setProduct(data.product))
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  if (loading) {
    return <div className="flex justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (!product) return null;

  const mainImage = product.images?.[0]?.url || '/images/placeholder.png';

  return (
    <div className="container mx-auto p-4">
      <Link href="/products" className="btn btn-ghost mb-4">
        ← Back to Products
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Section */}
        <div className="flex justify-center items-center">
          <div className="relative aspect-square bg-base-200 rounded-lg overflow-hidden w-full max-w-md">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-bold">${product.price}</p>
          <div className="divider"></div>
          <p className="text-gray-600">{product.description}</p>
          
          <div className="flex flex-col gap-4 mt-8">
            <AddToCartButton productId={product._id} />
            <button className="btn btn-outline">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 