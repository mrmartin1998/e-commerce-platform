import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * REVIEW MODEL EXPLANATION
 * ========================
 * This model represents a product review written by a user.
 * 
 * Key Concepts:
 * 1. REFERENCES: We use ObjectId to link reviews to users and products
 * 2. VALIDATION: We ensure ratings are between 1-5 and require certain fields
 * 3. TIMESTAMPS: Automatically track when reviews are created/updated
 * 4. VERIFIED PURCHASE: Track if user actually bought the product before reviewing
 */

const reviewSchema = new Schema({
  // WHO wrote the review? (Reference to User model)
  // 'ref' creates a relationship between collections
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This links to the User collection
    required: [true, 'User is required'] // Custom error message
  },

  // WHICH product is being reviewed? (Reference to Product model)
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product', // This links to the Product collection
    required: [true, 'Product is required']
  },

  // STAR RATING (1-5 stars)
  // We use min/max validators to ensure valid range
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5']
  },

  // REVIEW TEXT (the actual written review)
  // Not required - users can leave just a rating if they want
  comment: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
    trim: true // Removes whitespace from both ends
  },

  // VERIFIED PURCHASE FLAG
  // True if user actually bought this product before reviewing
  // This helps prevent fake reviews
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },

  // ADMIN MODERATION
  // Admin can approve/reject reviews to prevent spam
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, can change to false for manual moderation
  },

  // HELPFUL VOTES (future feature)
  // Track how many people found this review helpful
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  }

}, {
  // TIMESTAMPS: Mongoose automatically adds createdAt and updatedAt
  timestamps: true
});

/**
 * COMPOUND INDEX EXPLANATION
 * ==========================
 * Why do we need indexes?
 * - Indexes make database queries MUCH faster
 * - Think of it like an index in a book - helps you find things quickly
 * 
 * This compound index on [product, user]:
 * - Speeds up queries like "get all reviews for product X"
 * - Prevents duplicate reviews (one user can only review a product once)
 */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * STATIC METHOD EXPLANATION
 * =========================
 * Static methods are functions you can call on the Model itself
 * (not on individual documents)
 * 
 * This method calculates average rating for a product
 * We'll call it like: Review.calculateAverageRating(productId)
 */
reviewSchema.statics.calculateAverageRating = async function(productId) {
  // MongoDB Aggregation Pipeline - like Excel formulas for databases
  const stats = await this.aggregate([
    // Step 1: MATCH - Filter to only approved reviews for this product
    { 
      $match: { 
        product: productId,
        isApproved: true 
      } 
    },
    // Step 2: GROUP - Calculate average and count
    { 
      $group: {
        _id: '$product', // Group by product
        averageRating: { $avg: '$rating' }, // Calculate average
        numReviews: { $sum: 1 } // Count reviews
      } 
    }
  ]);

  // Return the results (or defaults if no reviews)
  return stats.length > 0 ? stats[0] : { averageRating: 0, numReviews: 0 };
};

/**
 * EXPORT EXPLANATION
 * ==================
 * This pattern prevents Mongoose from trying to redefine the model
 * in Next.js development mode (which causes errors with hot reload)
 * 
 * It says: "If the model already exists, use it. Otherwise, create it."
 */
export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
