# 🧪 Testing Documentation

## Overview

This document outlines the testing strategy, test checklists, and quality assurance processes for the E-Commerce Platform.

---

## Testing Strategy

### Test Coverage
- **Unit Tests:** Component-level testing using Vitest + React Testing Library
- **Integration Tests:** API endpoint testing
- **Manual Testing:** Feature validation and user flows
- **Performance Testing:** Lighthouse audits, load times
- **Mobile Testing:** Cross-device compatibility (375px-430px range)

### Testing Tools
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **Chrome DevTools** - Performance & mobile testing
- **Jest Coverage** - Code coverage reporting

---

## Manual Test Checklist

### 1. Authentication & User Management

#### User Registration
- [ ] Register with valid credentials
- [ ] Validate email format
- [ ] Password confirmation match
- [ ] Error handling for existing email
- [ ] Success notification and auto-login

#### User Login
- [ ] Login with valid credentials
- [ ] Error handling for invalid credentials
- [ ] Token storage in localStorage
- [ ] Persistence of login state after refresh
- [ ] Redirect to previous page after login

#### User Logout
- [ ] Clean logout process
- [ ] Token removal from localStorage
- [ ] Redirect to home page
- [ ] Cart state cleared appropriately

#### Session Management
- [ ] Token expiration handling (7-day default)
- [ ] Automatic refresh on protected routes
- [ ] Graceful handling of expired sessions
- [ ] Multiple device login handling

---

### 2. Product Browsing

#### Products Page
- [ ] Product grid displays correctly (1-4 columns responsive)
- [ ] Product images load with lazy loading
- [ ] Search functionality works
- [ ] Filters work (category, price range, sort)
- [ ] Pagination works correctly
- [ ] View toggle (grid/list) functions
- [ ] "Add to Cart" button works from product cards

#### Product Detail Page
- [ ] Product info displays correctly
- [ ] Image gallery navigation works
- [ ] Image thumbnails selectable
- [ ] Quantity selector works (+/- buttons ≥44px)
- [ ] "Add to Cart" button functional
- [ ] "Add to Wishlist" button works
- [ ] Reviews display correctly
- [ ] Review pagination works
- [ ] Submit review form functional

#### Search
- [ ] Search bar visible and accessible
- [ ] Search results accurate
- [ ] Search works from all pages
- [ ] Clear search button works
- [ ] No results state displays properly

---

### 3. Shopping Cart

#### Cart Management
- [ ] Add items to cart
- [ ] Update item quantities
- [ ] Remove items from cart
- [ ] Cart badge updates in navbar
- [ ] Cart persists after page refresh
- [ ] Cart dropdown accessible from navbar
- [ ] "Proceed to Checkout" button works

#### Cart Page
- [ ] Cart items display correctly
- [ ] Product images show (responsive: 80px mobile, 96px desktop)
- [ ] Quantity controls work (buttons ≥44px)
- [ ] Remove button works (≥44px)
- [ ] Subtotal calculates correctly
- [ ] Shipping cost displays
- [ ] Total calculates correctly
- [ ] "Continue Shopping" link works
- [ ] Sticky checkout button on mobile
- [ ] Order summary NOT sticky on mobile

---

### 4. Checkout Flow

#### Address Selection
- [ ] Existing addresses display as cards
- [ ] Address cards stack on mobile
- [ ] Radio buttons large enough (radio-lg on mobile)
- [ ] Default address pre-selected
- [ ] "Manage Addresses" link works
- [ ] Add new address works

#### Order Summary
- [ ] Collapsible on mobile, open on desktop
- [ ] Product images visible (≥120px)
- [ ] Product names and quantities shown
- [ ] Prices display correctly
- [ ] Subtotal, shipping, total accurate

#### Payment
- [ ] Stripe integration loads
- [ ] Payment form appears
- [ ] Test card processing works
- [ ] Error handling for failed payments
- [ ] Success redirect to order confirmation
- [ ] Payment button sticky on mobile (≥48px)

---

### 5. Order Management

#### Customer Orders Page
- [ ] Orders display as cards
- [ ] Order status badges show correct colors
- [ ] Order date formatted correctly
- [ ] Total amount displays
- [ ] "View Details" button works
- [ ] Empty state shows if no orders

#### Order Details Modal
- [ ] Modal opens on click
- [ ] Full-width on mobile
- [ ] Order items display
- [ ] Shipping address shows
- [ ] Order status visible
- [ ] Order history timeline shows
- [ ] Close button works (≥44px)

#### Order Tracking
- [ ] Status updates in real-time (on refresh)
- [ ] Status history shows chronologically
- [ ] Status timestamps accurate
- [ ] Admin notes visible (if present)
- [ ] Order tracking functional

---

### 6. Wishlist

#### Wishlist Management
- [ ] Add items to wishlist
- [ ] Wishlist badge updates in navbar
- [ ] Remove items from wishlist
- [ ] Wishlist persists after login
- [ ] Move to cart functionality works
- [ ] Empty wishlist state displays

#### Wishlist Page
- [ ] Items display in responsive grid (1-3 columns)
- [ ] Product images load
- [ ] Product info shows
- [ ] "Add to Cart" button works
- [ ] Remove button works
- [ ] "Continue Shopping" link works

---

### 7. User Profile

#### Profile Management
- [ ] User info displays correctly
- [ ] Edit profile form works
- [ ] Update name/email works
- [ ] Password change works
- [ ] Success/error notifications show

#### Address Management
- [ ] Addresses display as cards
- [ ] Add new address works
- [ ] Edit address works
- [ ] Delete address works
- [ ] Set default address works
- [ ] Address modal full-width on mobile
- [ ] Two-column form on desktop, single-column on mobile

---

### 8. Admin Features

#### Admin Dashboard
- [ ] Stats cards display (Revenue, Orders, Products, Users)
- [ ] Charts render correctly (responsive)
- [ ] Recent orders table/cards show
- [ ] Quick actions functional
- [ ] Access control enforced (admin only)

#### Product Management
- [ ] Products table displays (desktop)
- [ ] Products as cards on mobile (planned)
- [ ] Add product form works
- [ ] Edit product works
- [ ] Delete product works
- [ ] Bulk operations work
- [ ] Image upload functional
- [ ] Category assignment works

#### Order Management
- [ ] Orders table displays
- [ ] Status update modal works
- [ ] Order details modal shows all info
- [ ] Status history tracked
- [ ] Admin can add notes
- [ ] Filters work (status, date)

#### Category Management
- [ ] Categories list displays
- [ ] Add category works
- [ ] Edit category works
- [ ] Delete category works
- [ ] Category assignment to products works

#### User Management (Super Admin)
- [ ] Users table displays
- [ ] Role assignment works
- [ ] Role badges show correct colors
- [ ] Permission levels enforced
- [ ] Activity logs accessible

---

### 9. Responsive Design (Mobile Testing)

#### Target Devices
- [ ] iPhone SE (375px) - Smallest modern phone
- [ ] iPhone 14 (390px) - Standard iPhone
- [ ] Samsung S24+ (412px) - Primary Android target
- [ ] iPhone 14 Pro Max (430px) - Largest phone

#### Mobile Checklist
- [ ] No horizontal scroll on any page
- [ ] All buttons ≥44px (Apple minimum)
- [ ] Touch targets adequate spacing
- [ ] Text readable without zoom (≥14px)
- [ ] Forms don't trigger auto-zoom
- [ ] Navbar mobile menu works
- [ ] Cart dropdown responsive
- [ ] Product cards single column
- [ ] Footer newsletter doesn't overflow
- [ ] Auth pages cards don't overflow
- [ ] Sticky elements work correctly
- [ ] Collapsible sections function

#### Pages to Test
- [ ] Homepage - Hero, buttons, recently viewed
- [ ] Products - Grid, filters, search
- [ ] Product Detail - Gallery, buttons, reviews
- [ ] Cart - Items, controls, checkout button
- [ ] Checkout - Summary, address, payment
- [ ] Auth Pages - Login, register cards
- [ ] Profile - Forms, addresses
- [ ] Orders - Order cards, details
- [ ] Wishlist - Product grid

---

### 10. Performance Testing

#### Lighthouse Audits
- [ ] Performance score >90
- [ ] Accessibility score >95
- [ ] Best Practices score >90
- [ ] SEO score >90

#### Load Times
- [ ] First Contentful Paint <2s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3s
- [ ] Cumulative Layout Shift <0.1

#### Optimization
- [ ] Images lazy loading
- [ ] Next.js Image component used
- [ ] Code splitting working
- [ ] API response caching
- [ ] Static page generation where applicable

---

## Automated Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Test Coverage Goals
- **Overall:** >70%
- **Critical paths:** >90% (Auth, Cart, Checkout)
- **Components:** >80%
- **Utilities:** >85%

### Current Test Files
- `__tests__/api/auth.test.jsx` - Authentication APIs
- `__tests__/api/payment.test.jsx` - Payment processing
- `__tests__/api/products.test.jsx` - Product APIs
- `__tests__/components/products/SearchBar.test.jsx` - Search functionality
- `__tests__/components/ui/SkeletonLoader.test.jsx` - UI components
- `__tests__/store/cartStore.test.jsx` - Cart state management

---

## Bug Tracking

### Known Issues
- [ ] Token expiration after a few minutes (should be 7 days)
- [ ] Session timeout handling needs improvement
- [ ] Multiple device session management

### Testing Notes
```
Date: _________________
Tester: _______________

Issue: ________________
Steps to Reproduce:
1. 
2. 
3. 

Expected: _____________
Actual: _______________
Priority: High/Medium/Low
```

---

## Quality Checklist

Before considering a feature complete:
- [ ] All manual tests pass
- [ ] Automated tests written and passing
- [ ] Mobile responsive (375px-430px range)
- [ ] Touch targets ≥44px
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility validated
- [ ] Code reviewed
- [ ] Documentation updated

---

*For detailed order tracking test scenarios, see [ORDER_TRACKING.md](./ORDER_TRACKING.md)*  
*For test checklist updates, see [test-checklist.md](./test-checklist.md)*
