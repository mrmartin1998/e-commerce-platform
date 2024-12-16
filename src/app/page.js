"use client";

import Image from "next/image";
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
          <button className="btn btn-primary">Start Shopping</button>
        </div>
      </div>
    </div>
  );
}
