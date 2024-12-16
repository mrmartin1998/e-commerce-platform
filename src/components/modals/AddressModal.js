"use client";

import { useState } from 'react';

export default function AddressModal({ isOpen, onClose, onSave, address = null }) {
  const [formData, setFormData] = useState({
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    country: address?.country || '',
    zipCode: address?.zipCode || '',
    isDefault: address?.isDefault || false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = address?._id 
        ? `/api/users/addresses/${address._id}`
        : '/api/users/addresses';
      
      const res = await fetch(url, {
        method: address?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      onSave(data.address);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {address ? 'Edit Address' : 'Add New Address'}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Street Address</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.street}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                street: e.target.value
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">City</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  city: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">State/Province</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  state: e.target.value
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Country</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  country: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">ZIP/Postal Code</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  zipCode: e.target.value
                }))}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Set as default address</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isDefault: e.target.checked
                }))}
              />
            </label>
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 