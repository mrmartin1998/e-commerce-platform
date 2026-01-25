const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can only have one wishlist
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries (userId already has unique index, so skip duplicate)
wishlistSchema.index({ 'items.productId': 1 });

module.exports = wishlistSchema;
