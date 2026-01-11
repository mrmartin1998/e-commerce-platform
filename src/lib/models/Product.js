import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10, // Default warning when stock hits 10 or below
    min: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    name: String,
    size: Number,
    type: String
  }],
  // Review-related fields
  // These are denormalized data (stored in both Product and Review models)
  // Why? For performance - showing average ratings on product cards without querying all reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    // Validation: ensure rating is between 0 and 5
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 5;
      },
      message: 'Average rating must be between 0 and 5'
    }
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
    // Validation: ensure count is not negative
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Review count cannot be negative'
    }
  }
}, {
  timestamps: true
});

// Indexes for query optimization
// Compound index for common filtered queries (status + category + sorting by date)
productSchema.index({ status: 1, category: 1, createdAt: -1 });

// Compound index for price range filtering with status
productSchema.index({ status: 1, price: 1 });

// Text index for search functionality on name and description
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);