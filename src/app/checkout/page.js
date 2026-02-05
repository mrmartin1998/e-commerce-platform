'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!items?.length) {
      router.push('/cart');
    }
  }, [items, router]);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        setAddresses(data.user.addresses || []);
        const defaultAddress = data.user.addresses?.find(addr => addr.isDefault);
        setSelectedAddress(defaultAddress || data.user.addresses?.[0] || null);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        showToast('Failed to load addresses', 'error');
      }
    }

    fetchAddresses();
  }, [showToast]);

  const subtotal = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = 10; // Fixed shipping cost
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedAddress) {
        throw new Error('Please select a shipping address');
      }

      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items,
          shipping,
          shippingAddress: selectedAddress
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.url) {
        throw new Error('Invalid checkout session response');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      clearCart(); // Clear cart state
      showToast('Order placed successfully!', 'success');
      router.push('/orders'); // Redirect to orders page
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (!items?.length) {
    return <div className="flex justify-center p-8">Redirecting to cart...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pb-24 md:pb-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Collapsible on mobile, regular card on desktop */}
            <div className="collapse md:collapse-open collapse-arrow md:collapse-plus bg-base-100 shadow-xl md:card">
              <input type="checkbox" defaultChecked className="md:hidden" />
              <div className="collapse-title text-xl font-bold md:hidden">
                Order Summary ({items.length} items)
              </div>
              <div className="collapse-content md:card-body">
                <h2 className="card-title hidden md:block">Order Summary</h2>
                <div className="divider"></div>
                
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 md:gap-6 mb-4">
                    <div className="w-24 h-24 md:w-28 md:h-28 relative shrink-0">
                      <Image
                        src={item.image || '/images/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{item.name}</h3>
                      <p className="text-base-content/70">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-base-content/70">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
                
                {/* Totals - Only show on desktop inside collapsible */}
                <div className="hidden md:block">
                  <div className="divider"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals Card - Always visible on mobile, hidden on desktop */}
            <div className="card bg-base-100 shadow-xl md:hidden">
              <div className="card-body p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Shipping</span>
                    <span className="font-semibold">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Selection */}
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">Shipping Address</h2>
                  <Link href="/profile" className="btn btn-ghost btn-sm md:btn-md min-h-[44px]">
                    Manage Addresses
                  </Link>
                </div>
                <div className="divider"></div>
                
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div 
                        key={address._id}
                        className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors
                          ${selectedAddress?._id === address._id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="card-body p-4 md:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{address.street}</p>
                              <p className="text-sm md:text-base">{address.city}, {address.state} {address.zipCode}</p>
                              <p className="text-sm md:text-base">{address.country}</p>
                              {address.isDefault && (
                                <span className="badge badge-primary mt-2">Default</span>
                              )}
                            </div>
                            <input 
                              type="radio"
                              className="radio radio-primary radio-lg md:radio-md"
                              checked={selectedAddress?._id === address._id}
                              onChange={() => setSelectedAddress(address)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-4">No shipping addresses found.</p>
                    <Link href="/profile" className="btn btn-primary btn-sm">
                      Add Address
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="fixed bottom-0 left-0 right-0 bg-base-100 p-4 shadow-lg z-40 md:relative md:shadow-xl md:p-0 md:card md:h-fit">
            <div className="md:card-body">
              <h2 className="card-title hidden md:block">Payment</h2>
              <div className="divider hidden md:block"></div>
              {error && (
                <div className="alert alert-error mb-4">
                  {error}
                </div>
              )}
              <button 
                className={`btn btn-primary w-full min-h-[48px] ${loading ? 'loading' : ''}`}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}