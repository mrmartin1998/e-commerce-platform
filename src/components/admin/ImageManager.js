'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function ImageManager({ images = [], onChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef();

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add new images to existing ones
      const newImages = [...images, ...data.images];
      onChange(newImages);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer
          hover:border-primary hover:bg-base-200 transition-colors
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="loading loading-spinner"></span>
            <span>Uploading images...</span>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">📷</div>
            <p className="text-base-content/70">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-base-content/50 mt-1">
              {images.length}/{maxImages} images • Max 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Product Images</h3>
            {images.length > 0 && (
              <span className="badge badge-primary badge-sm">
                First image is main thumbnail
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`
                  relative group bg-base-200 rounded-lg overflow-hidden cursor-move
                  ${index === 0 ? 'ring-2 ring-primary' : ''}
                  ${draggedIndex === index ? 'opacity-50' : ''}
                `}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleImageDrop(e, index)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Main image indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="badge badge-primary badge-xs">Main</span>
                  </div>
                )}
                
                {/* Image controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => removeImage(index)}
                    className="btn btn-sm btn-error btn-circle"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Drag indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="badge badge-ghost badge-xs">↕️</span>
                </div>
              </div>
            ))}
          </div>
          
          {images.length > 1 && (
            <p className="text-sm text-base-content/60">
              💡 Drag images to reorder. First image will be the main product thumbnail.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
