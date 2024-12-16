"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    addresses: []
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfile(data.user);
        }
      })
      .catch(err => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone (optional)</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={profile.email}
                  disabled
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">Email cannot be changed</span>
                </label>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary w-full ${saving ? 'loading' : ''}`}
                disabled={saving}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        <div className="divider">Addresses</div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Shipping Addresses</h2>
              <button className="btn btn-primary btn-sm">
                Add New Address
              </button>
            </div>

            {profile.addresses?.length > 0 ? (
              <div className="space-y-4">
                {profile.addresses.map((address) => (
                  <div key={address._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title">{address.name}</h3>
                      <p>{address.address}</p>
                      <div className="mt-4">
                        <button className="btn btn-primary btn-sm">
                          Edit
                        </button>
                        <button className="btn btn-error btn-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No addresses found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 