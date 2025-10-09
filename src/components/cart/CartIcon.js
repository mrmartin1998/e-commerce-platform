"use client";

import { useCart } from '@/store/cartStore';
import { useEffect, useState, useRef } from 'react';
import CartDropdown from './CartDropdown';

export default function CartIcon() {
  const { items, fetchCart, loading, error } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="indicator relative" ref={dropdownRef}>
      {loading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : error ? (
        <div className="tooltip tooltip-bottom" data-tip={error}>
          <span className="text-error cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            ⚠️
          </span>
        </div>
      ) : (
        <>
          {itemCount > 0 && (
            <span className="indicator-item badge badge-primary badge-sm">
              {itemCount}
            </span>
          )}
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
          </button>
          <CartDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}