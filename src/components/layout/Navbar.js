"use client";

import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import WishlistIcon from '@/components/wishlist/WishlistIcon';
import { useCart } from '@/store/cartStore';
import { useState, useEffect, useCallback } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { items } = useCart();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            className="btn btn-ghost lg:hidden mobile-menu-button min-w-[44px] min-h-[44px]"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul 
            tabIndex={0} 
            className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-64 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          >
            <li><Link href="/products" onClick={toggleMobileMenu}>Products</Link></li>
            {/* 
            <li><Link href="/categories" onClick={toggleMobileMenu}>Categories</Link></li>
            */}
            <li>
              <Link href="/cart" onClick={toggleMobileMenu} className="indicator">
                Cart
                {isMounted && cartItemCount > 0 && (
                  <span className="badge badge-sm badge-primary indicator-item">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </li>
            <li><Link href="/wishlist" onClick={toggleMobileMenu}>Wishlist</Link></li>
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
          <li>
            <Link href="/cart" className="indicator">
              Cart
              {isMounted && cartItemCount > 0 && (
                <span className="badge badge-sm badge-primary indicator-item">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </li>
          <li><WishlistIcon /></li>
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
              className="btn btn-ghost btn-circle avatar profile-menu-button min-w-[44px] min-h-[44px]"
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
              className={`mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-64 max-h-[80vh] overflow-y-auto ${isProfileMenuOpen ? 'block' : 'hidden'}`}
            >
              {/* User Info Section */}
              <li className="menu-title">
                <span className="flex items-center justify-between">
                  <span>{user.name}</span>
                  {user?.role && (
                    <span className={`badge badge-xs ${
                      user.role === 'super_admin' ? 'badge-error' :
                      user.role === 'admin' ? 'badge-warning' :
                      user.role === 'editor' ? 'badge-info' :
                      user.role === 'viewer' ? 'badge-ghost' :
                      'badge-ghost'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' :
                       user.role === 'admin' ? 'Admin' :
                       user.role === 'editor' ? 'Editor' :
                       user.role === 'viewer' ? 'Viewer' :
                       'User'}
                    </span>
                  )}
                </span>
              </li>
              
              <li><Link href="/profile" onClick={toggleProfileMenu}>Profile</Link></li>
              <li><Link href="/orders" onClick={toggleProfileMenu}>Orders</Link></li>
              
              {/* Admin Section - Permission-based visibility */}
              {(user?.isAdmin || ['viewer', 'editor', 'admin', 'super_admin'].includes(user?.role)) && (
                <>
                  <div className="divider my-0">Admin</div>
                  <li><Link href="/admin" onClick={toggleProfileMenu}>Admin Dashboard</Link></li>
                  <li><Link href="/admin/products" onClick={toggleProfileMenu}>
                    Manage Products
                    {user?.role === 'viewer' && <span className="badge badge-xs ml-1">View Only</span>}
                  </Link></li>
                  <li><Link href="/admin/categories" onClick={toggleProfileMenu}>
                    Manage Categories
                    {user?.role === 'viewer' && <span className="badge badge-xs ml-1">View Only</span>}
                  </Link></li>
                  <li><Link href="/admin/orders" onClick={toggleProfileMenu}>
                    Manage Orders
                    {user?.role === 'viewer' && <span className="badge badge-xs ml-1">View Only</span>}
                  </Link></li>
                  <li><Link href="/admin/analytics" onClick={toggleProfileMenu}>Analytics</Link></li>
                  
                  {/* Super Admin Only */}
                  {user?.role === 'super_admin' && (
                    <>
                      <div className="divider my-0 opacity-50"></div>
                      <li><Link href="/admin/users" onClick={toggleProfileMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        User Management
                      </Link></li>
                      <li><Link href="/admin/activity" onClick={toggleProfileMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        Activity Logs
                      </Link></li>
                    </>
                  )}
                </>
              )}
              
              <div className="divider my-0"></div>
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