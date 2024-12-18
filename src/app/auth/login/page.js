"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      // Redirect to products page
      window.location.href = '/products';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4">Sign In</h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Sign In
            </button>
          </form>

          <div className="divider">or</div>

          <Link href="/auth/register" className="btn btn-outline w-full">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
