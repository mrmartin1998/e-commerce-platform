"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import RecentlyViewed from "@/components/products/RecentlyViewed";

export default function Home() {
  return (
    <div>
      <div className="hero min-h-[calc(100vh-4rem)]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Welcome to Our Store</h1>
            <p className="py-6 text-base md:text-lg">
              Discover our amazing products with great prices and excellent quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn btn-primary min-h-[48px]">
                Start Shopping
              </Link>
              <div className="divider divider-horizontal hidden sm:flex">or</div>
              <div className="flex gap-2 justify-center">
                <Link href="/auth/register" className="btn btn-outline min-h-[48px]">
                  Register
                </Link>
                <Link href="/auth/login" className="btn btn-ghost min-h-[48px]">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recently Viewed Products */}
      <div className="container mx-auto px-4 py-12">
        <RecentlyViewed 
          title="Continue Shopping" 
          showClearButton={true}
        />
      </div>
    </div>
  );
}
