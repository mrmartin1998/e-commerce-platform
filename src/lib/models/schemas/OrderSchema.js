const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentInfo: {
    stripePaymentId: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  /**
   * STATUS HISTORY TRACKING
   * =======================
   * 
   * WHY THIS EXISTS:
   * - Provides complete audit trail of order status changes
   * - Shows customers the journey of their order
   * - Tracks which admin made each change (accountability)
   * - Allows admins to add notes explaining status changes
   * 
   * EXAMPLE USE CASE:
   * Customer calls: "When did my order ship?"
   * You can say: "It shipped on Jan 11 at 2:00 PM by Admin John, who noted 'Shipped via UPS Ground'"
   * 
   * STRUCTURE:
   * Each entry records one status change with full context
   */
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // null for system-generated changes (e.g., order creation)
      // userId for admin-initiated changes
    },
    note: {
      type: String,
      // Optional: "Payment confirmed", "Customer requested cancellation", etc.
    }
  }],
  
  /**
   * SHIPPING TRACKING INFORMATION
   * =============================
   * 
   * trackingNumber: The carrier's tracking ID (e.g., "1Z9999999999999999")
   * trackingUrl: Direct link to carrier's tracking page
   * carrier: Shipping company name (e.g., "UPS", "FedEx", "USPS")
   * estimatedDelivery: When customer should expect delivery
   * 
   * WHY SEPARATE FROM statusHistory?
   * - These are shipping-specific details
   * - trackingNumber already existed, we're enhancing it
   * - Users want this info prominently displayed, not buried in history
   */
  trackingNumber: String,
  trackingUrl: {
    type: String,
    // Example: "https://www.ups.com/track?tracknum=1Z9999999999999999"
    // Makes tracking clickable for customers!
  },
  carrier: {
    type: String,
    enum: ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'],
    // Standardize carrier names for consistency
  },
  estimatedDelivery: {
    type: Date,
    // Calculated based on shipping method and carrier estimates
    // Gives customers realistic expectations
  },
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paymentIntentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paidAt: Date
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = this.subtotal * 0.15; // 15% tax example
  this.shipping = 10; // Flat rate shipping example
  this.total = this.subtotal + this.tax + this.shipping;
  next();
});

/**
 * AUTOMATIC STATUS HISTORY INITIALIZATION
 * =======================================
 * 
 * WHAT THIS DOES:
 * When a new order is created, automatically add the first entry to statusHistory
 * 
 * WHY IT'S IMPORTANT:
 * - Every order should have at least one history entry (creation)
 * - Prevents empty statusHistory arrays
 * - Provides consistent data structure
 * 
 * HOW IT WORKS:
 * 1. Check if this is a NEW order (not yet saved to database)
 * 2. Check if statusHistory is empty
 * 3. Add initial entry with current status and timestamp
 * 
 * EXAMPLE:
 * New order created → statusHistory = [{ status: 'pending', timestamp: now, note: 'Order created' }]
 */
orderSchema.pre('save', function(next) {
  // isNew is a Mongoose property that's true only for brand new documents
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [{
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.userId, // The customer who created the order
      note: 'Order created'
    }];
  }
  next();
});

/**
 * HELPER METHOD: Add Status History Entry
 * ========================================
 * 
 * USAGE:
 * order.addStatusChange('shipped', adminUserId, 'Shipped via UPS');
 * await order.save();
 * 
 * BENEFITS:
 * - Consistent way to update status across the app
 * - Automatically records timestamp
 * - Ensures statusHistory stays synchronized with current status
 * - Prevents manual errors
 */
orderSchema.methods.addStatusChange = function(newStatus, updatedBy, note) {
  // Update the current status
  this.status = newStatus;
  
  // Add entry to history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    note: note || `Status changed to ${newStatus}`
  });
  
  // Update the updatedAt timestamp
  this.updatedAt = new Date();
};

module.exports = orderSchema; 