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
  }]
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);