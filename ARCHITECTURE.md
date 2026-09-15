# 🏗️ System Architecture

## Overview

The E-Commerce Platform is built using modern web technologies with a focus on performance, scalability, and maintainability. This document outlines the system architecture, technology stack, and design decisions.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │   Mobile     │  │   Tablet     │         │
│  │  (Desktop)   │  │   (Phone)    │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                          │                                       │
│                    Next.js App                                   │
│              (React 19 + App Router)                            │
│                          │                                       │
│  ┌───────────────────────┴────────────────────────┐            │
│  │                                                  │            │
│  │  Pages          Components       State Mgmt    │            │
│  │  (/app)         (/components)    (Zustand)     │            │
│  │                                                  │            │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Next.js API Routes                         │    │
│  │              (/app/api/*)                              │    │
│  │                                                          │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │    │
│  │  │  Auth   │  │Products │  │  Cart   │  │ Orders  │  │    │
│  │  │   API   │  │   API   │  │   API   │  │   API   │  │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │    │
│  │                                                          │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │    │
│  │  │ Payment │  │  Admin  │  │  Email  │  │Wishlist │  │    │
│  │  │   API   │  │   API   │  │   API   │  │   API   │  │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Middleware Layer                           │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │     Auth     │  │   RBAC       │  │   Logging    │ │    │
│  │  │  Middleware  │  │  Middleware  │  │  Middleware  │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   MongoDB Atlas                           │  │
│  │                                                            │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │  │  Users  │  │Products │  │  Carts  │  │ Orders  │    │  │
│  │  │ (Users) │  │(Products)│  │ (Carts) │  │(Orders) │    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  │                                                            │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │  │Reviews  │  │Categories│ │Activity │  │Wishlist │    │  │
│  │  │(Reviews)│  │(Categs)  │ │  Logs   │  │(Wishes) │    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Stripe     │  │  Cloudinary  │  │    Resend    │         │
│  │  (Payments)  │  │   (Images)   │  │   (Emails)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15.0.3 (React 19)
- **Routing:** App Router (Next.js)
- **Styling:** Tailwind CSS 3.4.1 + DaisyUI 4.12.14
- **State Management:** Zustand 5.0.2
- **HTTP Client:** Native Fetch API
- **Image Optimization:** Next.js Image component

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MongoDB 6.12.0 (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **File Uploads:** Multer (for Cloudinary)

### External Services
- **Payment Processing:** Stripe
- **Image Hosting:** Cloudinary
- **Email Service:** Resend
- **Hosting:** Vercel (recommended)
- **Database Hosting:** MongoDB Atlas

### Development Tools
- **Testing:** Vitest 2.1.8 + React Testing Library
- **Linting:** ESLint 8
- **Code Quality:** Prettier (recommended)
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions

---

## Data Model

### Core Entities

```javascript
// User Schema
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String ['customer', 'viewer', 'editor', 'admin', 'super_admin'],
  isAdmin: Boolean,
  addresses: [AddressSchema],
  createdAt: Date,
  updatedAt: Date
}

// Product Schema
{
  _id: ObjectId,
  name: String (required, indexed),
  description: String,
  price: Number (required),
  category: String (indexed),
  stock: Number (default: 0),
  images: [String],
  status: String ['active', 'inactive'],
  createdAt: Date,
  updatedAt: Date
}

// Order Schema
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  items: [OrderItemSchema],
  shippingAddress: AddressSchema,
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: String ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  statusHistory: [StatusHistorySchema],
  stripeSessionId: String,
  createdAt: Date,
  updatedAt: Date
}

// Cart Schema
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  items: [CartItemSchema],
  createdAt: Date,
  updatedAt: Date
}

// Category Schema
{
  _id: ObjectId,
  name: String (required, unique, indexed),
  description: String,
  slug: String (unique, indexed),
  createdAt: Date,
  updatedAt: Date
}

// Review Schema
{
  _id: ObjectId,
  product: ObjectId (ref: 'Product', indexed),
  user: ObjectId (ref: 'User', indexed),
  rating: Number (1-5),
  title: String,
  comment: String,
  createdAt: Date,
  updatedAt: Date
}

// ActivityLog Schema
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  action: String ['create', 'update', 'delete', 'login', 'logout'],
  resourceType: String,
  resourceId: ObjectId,
  changes: Object,
  timestamp: Date (indexed)
}

// Wishlist Schema
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  products: [ObjectId] (ref: 'Product'),
  createdAt: Date,
  updatedAt: Date
}
```

### Relationships
- **User → Orders:** One-to-Many
- **User → Cart:** One-to-One
- **User → Wishlist:** One-to-One
- **User → Reviews:** One-to-Many
- **Product → Reviews:** One-to-Many
- **Category → Products:** One-to-Many

---

## Authentication Flow

```
┌──────────┐                                ┌──────────┐
│  Client  │                                │  Server  │
└────┬─────┘                                └────┬─────┘
     │                                           │
     │  1. POST /api/auth/login                 │
     │  { email, password }                     │
     ├──────────────────────────────────────────>
     │                                           │
     │                            2. Verify credentials
     │                            3. Hash password comparison
     │                            4. Generate JWT token
     │                                           │
     │  5. Return { token, user }               │
     <──────────────────────────────────────────┤
     │                                           │
     │  6. Store token in localStorage          │
     │                                           │
     │  7. Protected API request                │
     │  Authorization: Bearer <token>           │
     ├──────────────────────────────────────────>
     │                                           │
     │                            8. Verify JWT token
     │                            9. Decode user info
     │                            10. Check permissions
     │                                           │
     │  11. Return protected data               │
     <──────────────────────────────────────────┤
     │                                           │
```

---

## API Routes Structure

```
/api
├── /auth
│   ├── /login         (POST)   - User authentication
│   ├── /register      (POST)   - User registration
│   └── /logout        (POST)   - User logout
│
├── /products
│   ├── /              (GET)    - List products (with filters)
│   ├── /[id]          (GET)    - Get single product
│   ├── /              (POST)   - Create product (admin)
│   ├── /[id]          (PUT)    - Update product (admin)
│   └── /[id]          (DELETE) - Delete product (admin)
│
├── /cart
│   ├── /              (GET)    - Get user cart
│   ├── /              (POST)   - Add item to cart
│   ├── /              (PUT)    - Update cart item
│   └── /[productId]   (DELETE) - Remove from cart
│
├── /orders
│   ├── /              (GET)    - Get user orders
│   ├── /[id]          (GET)    - Get order details
│   ├── /create        (POST)   - Create order
│   └── /[id]/status   (PUT)    - Update order status (admin)
│
├── /checkout
│   └── /session       (POST)   - Create Stripe session
│
├── /payment
│   └── /webhook       (POST)   - Stripe webhook handler
│
├── /categories
│   ├── /              (GET)    - List categories
│   ├── /              (POST)   - Create category (admin)
│   ├── /[id]          (PUT)    - Update category (admin)
│   └── /[id]          (DELETE) - Delete category (admin)
│
├── /reviews
│   ├── /              (GET)    - Get reviews (by product)
│   ├── /              (POST)   - Create review
│   ├── /[id]          (PUT)    - Update review
│   └── /[id]          (DELETE) - Delete review
│
├── /wishlist
│   ├── /              (GET)    - Get user wishlist
│   ├── /              (POST)   - Add to wishlist
│   └── /[productId]   (DELETE) - Remove from wishlist
│
├── /users
│   ├── /profile       (GET)    - Get user profile
│   ├── /profile       (PUT)    - Update profile
│   └── /addresses     (POST)   - Add/update addresses
│
└── /admin
    ├── /products
    │   ├── /bulk-delete       (POST) - Bulk delete
    │   ├── /bulk-update-status (POST) - Bulk status update
    │   └── /bulk-update-category (POST) - Bulk category update
    │
    ├── /users         (GET)    - List all users (super admin)
    ├── /users/[id]/role (PUT)  - Update user role (super admin)
    ├── /activity      (GET)    - Get activity logs
    └── /analytics     (GET)    - Get analytics data
```

---

## State Management

### Zustand Stores

```javascript
// Cart Store
{
  items: [],
  loading: false,
  fetchCart: async () => {},
  addItem: async (productId, quantity) => {},
  updateQuantity: async (productId, quantity) => {},
  removeItem: async (productId) => {},
  clearCart: () => {}
}

// Wishlist Store
{
  items: [],
  loading: false,
  fetchWishlist: async () => {},
  addItem: async (productId) => {},
  removeItem: async (productId) => {},
  isInWishlist: (productId) => boolean
}

// Auth Store (if implemented)
{
  user: null,
  token: null,
  isAuthenticated: boolean,
  login: async (email, password) => {},
  logout: () => {},
  register: async (userData) => {}
}
```

---

## Security Implementation

### Authentication Security
- JWT tokens with 7-day expiration
- Passwords hashed with bcrypt (10 rounds)
- Tokens stored in localStorage (consider httpOnly cookies)
- Token validation on every protected route

### Authorization
- Role-based access control (RBAC)
- Permission middleware on API routes
- Client-side route guards
- Admin-only route protection

### Data Protection
- Input sanitization on forms
- MongoDB injection prevention
- XSS prevention via React
- CSRF tokens (recommended for forms)
- Environment variables for secrets
- HTTPS enforcement (production)

### API Security
- Rate limiting (recommended)
- Request validation
- Error message sanitization
- CORS configuration
- Authentication middleware

---

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting:** Automatic via Next.js
- **Lazy Loading:** Images via Next.js Image component
- **Static Generation:** For product pages (ISR)
- **Client-Side Caching:** React Query (recommended)
- **Bundle Size:** Tree shaking, minification

### Backend Optimizations
- **Database Indexing:** Email, product name, category
- **Query Optimization:** Selective field projection
- **Aggregation Pipelines:** For analytics
- **Connection Pooling:** Mongoose default
- **Caching Strategy:** API response caching (recommended)

### Image Optimization
- **Cloudinary CDN:** All product images
- **Next.js Image:** Automatic WebP conversion
- **Lazy Loading:** Below-the-fold images
- **Responsive Images:** Multiple sizes generated
- **Compression:** Cloudinary auto-optimization

---

## Deployment Architecture

### Recommended Setup

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend + API)        │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  Next.js Application           │    │
│  │  - Pages (SSR/SSG)             │    │
│  │  - API Routes (Serverless)     │    │
│  │  - Static Assets (CDN)         │    │
│  └────────────────────────────────┘    │
│                                          │
└─────────────────┬────────────────────────┘
                  │
                  │
┌─────────────────▼────────────────────────┐
│         MongoDB Atlas (Database)         │
│                                          │
│  - Clustered deployment                 │
│  - Automatic backups                    │
│  - Point-in-time recovery               │
│  - SSL/TLS encryption                   │
│                                          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│       External Services (APIs)           │
│                                          │
│  ┌────────────┐  ┌─────────────┐       │
│  │  Stripe    │  │ Cloudinary  │       │
│  │ (Payments) │  │   (Images)  │       │
│  └────────────┘  └─────────────┘       │
│                                          │
│  ┌────────────┐                         │
│  │  Resend    │                         │
│  │  (Emails)  │                         │
│  └────────────┘                         │
│                                          │
└──────────────────────────────────────────┘
```

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-secret-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Resend
RESEND_API_KEY=re_...
```

---

## Scalability Considerations

### Current Limitations
- Single MongoDB replica set
- Serverless function cold starts
- No CDN for API responses
- No caching layer

### Future Improvements
- **Database Scaling:** MongoDB sharding
- **Caching Layer:** Redis for sessions/cart
- **CDN:** CloudFlare for API caching
- **Load Balancing:** Multiple regions
- **Microservices:** Separate payment service
- **Message Queue:** For order processing
- **Search Engine:** Elasticsearch for products

---

## Monitoring & Logging

### Recommended Tools
- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics
- **Logging:** Papertrail or Logtail
- **Uptime Monitoring:** UptimeRobot
- **Database Monitoring:** MongoDB Atlas built-in

### Metrics to Track
- API response times
- Database query performance
- Error rates
- User authentication success rate
- Conversion funnel metrics
- Cart abandonment rate

---

## Development Workflow

### Branch Strategy
See [.github/BRANCH_STRATEGY.md](.github/BRANCH_STRATEGY.md)

### Code Review
See [.github/CODE_REVIEW_CHECKLIST.md](.github/CODE_REVIEW_CHECKLIST.md)

### Testing Strategy
See [docs/TESTING.md](docs/TESTING.md)

---

## Additional Resources

- **Features Documentation:** [docs/FEATURES.md](docs/FEATURES.md)
- **Performance Guide:** [docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- **Email Implementation:** [docs/EMAIL_NOTIFICATIONS.md](docs/EMAIL_NOTIFICATIONS.md)
- **Order Tracking Guide:** [docs/ORDER_TRACKING.md](docs/ORDER_TRACKING.md)

---

*Last Updated: February 23, 2026*
