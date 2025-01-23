"use client";

import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import { useState, useEffect, useCallback } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Failed to fetch user:', err))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }, [isProfileMenuOpen]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
      if (!event.target.closest('.profile-menu') && !event.target.closest('.profile-menu-button')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown mobile-menu">
          <div 
            tabIndex={0}
            role="button" 
            className="btn btn-ghost lg:hidden mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul 
            tabIndex={0} 
            className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          >
            <li><Link href="/products" onClick={toggleMobileMenu}>Products</Link></li>
            {/* 
            <li><Link href="/categories" onClick={toggleMobileMenu}>Categories</Link></li>
            */}
            <li><Link href="/cart" onClick={toggleMobileMenu}>Cart</Link></li>
            
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">E-Commerce</Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/products">Products</Link></li>
          {/* 
          <li><Link href="/categories">Categories</Link></li>
          */}
          <li><Link href="/cart">Cart</Link></li>
        </ul>
      </div>
      
      <div className="navbar-end">
        <ThemeSwitcher />
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : user ? (
          <div className="dropdown dropdown-end profile-menu">
            <div 
              tabIndex={0}
              role="button" 
              className="btn btn-ghost btn-circle avatar profile-menu-button"
              onClick={toggleProfileMenu}
              aria-expanded={isProfileMenuOpen}
            >
              <div className="w-10 rounded-full bg-primary text-primary-content">
                <span className="text-xl leading-10 text-center block">
                  {user.name[0].toUpperCase()}
                </span>
              </div>
            </div>
            <ul 
              tabIndex={0} 
              className={`mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 ${isProfileMenuOpen ? 'block' : 'hidden'}`}
            >
              <li><Link href="/profile" onClick={toggleProfileMenu}>Profile</Link></li>
              <li><Link href="/orders" onClick={toggleProfileMenu}>Orders</Link></li>
              {user?.isAdmin && (
                <li><Link href="/admin/products" onClick={toggleProfileMenu}>Manage Products</Link></li>
              )}
              <li><button onClick={() => { toggleProfileMenu(); handleLogout(); }}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <Link href="/auth/login" className="btn btn-ghost">Login</Link>
        )}
      </div>
    </div>
  );
} 