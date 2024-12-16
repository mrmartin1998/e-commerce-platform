"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  return (
    <div className="hero min-h-[calc(100vh-4rem)]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to Our Store</h1>
          <p className="py-6">
            Discover our amazing products with great prices and excellent quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn btn-primary">
              Start Shopping
            </Link>
            <div className="divider divider-horizontal hidden sm:flex">or</div>
            <div className="flex gap-2">
              <Link href="/auth/register" className="btn btn-outline">
                Register
              </Link>
              <Link href="/auth/login" className="btn btn-ghost">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
