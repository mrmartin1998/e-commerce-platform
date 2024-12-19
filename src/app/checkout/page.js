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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Order Summary</h2>
              <div className="divider"></div>
              
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-6 mb-4">
                  <div className="w-20 h-20 relative shrink-0">
                    <Image
                      src={item.image || '/images/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
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
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address Selection */}
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Shipping Address</h2>
                <Link href="/profile" className="btn btn-ghost btn-sm">
                  Manage Addresses
                </Link>
              </div>
              <div className="divider"></div>
              
              {addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <div 
                      key={address._id}
                      className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors
                        ${selectedAddress?._id === address._id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                            {address.isDefault && (
                              <span className="badge badge-primary mt-2">Default</span>
                            )}
                          </div>
                          <input 
                            type="radio"
                            className="radio radio-primary"
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
        <div className="card bg-base-100 shadow-xl h-fit">
          <div className="card-body">
            <h2 className="card-title">Payment</h2>
            <div className="divider"></div>
            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}
            <button 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}