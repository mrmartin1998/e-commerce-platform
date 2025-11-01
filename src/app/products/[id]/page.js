"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AddToCartButton from '@/components/products/AddToCartButton';
import { useCart } from '@/store/cartStore';

async function getProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params?.id) {
      getProduct(params.id)
        .then(data => setProduct(data.product))
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '/images/placeholder.png',
        quantity
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error || 'Product not found'}</span>
        </div>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: '/images/placeholder.png' }];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-base-200">
            <Image
              src={productImages[selectedImageIndex].url}
              alt={`${product.name} - Image ${selectedImageIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
            
            {/* Image Navigation for Multiple Images */}
            {productImages.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex === 0 ? productImages.length - 1 : selectedImageIndex - 1
                  )}
                >
                  ❮
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex === productImages.length - 1 ? 0 : selectedImageIndex + 1
                  )}
                >
                  ❯
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-base-300'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-primary text-2xl font-semibold mt-2">
              ${product.price}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-base-content/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <p className="text-sm">
              <span className="font-semibold">Category:</span> {product.category}
            </p>
            <p className="text-sm mt-1">
              <span className="font-semibold">Stock:</span> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-outline btn-sm btn-circle"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-base-200 rounded text-center min-w-12">
                    {quantity}
                  </span>
                  <button 
                    className="btn btn-outline btn-sm btn-circle"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <div className="alert alert-warning">
              <span>This item is currently out of stock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}