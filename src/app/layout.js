import { Suspense } from 'react';
import { CartProvider } from '@/store/cartStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from '@/components/ui/Toast';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata = {
  title: "E-Commerce Platform",
  description: "Modern e-commerce platform built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${geistSans.variable} min-h-screen bg-base-100 flex flex-col`}>
        <ToastProvider>
          <CartProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Navbar />
            </Suspense>
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
