# E-Commerce Platform Test Checklist

## 1. Authentication & User Management
- [ ] User Registration
  - [ ] Register with valid credentials
  - [ ] Validate email format
  - [ ] Password confirmation match
  - [ ] Error handling for existing email

- [ ] User Login
  - [ ] Login with valid credentials
  - [ ] Error handling for invalid credentials
  - [ ] Token storage in localStorage
  - [ ] Persistence of login state after refresh

- [ ] User Logout
  - [ ] Clean logout
  - [ ] Token removal
  - [ ] Redirect to home page

General auth issues:
  - After logging in the token only lasts for a few minutes after that it expires.

Additional Test Cases:
- [ ] Password Reset Flow
  - [ ] Reset email delivery
  - [ ] Reset token expiration
  - [ ] New password validation
  - [ ] Success/error notifications

- [ ] Session Management
  - [ ] Token refresh mechanism
  - [ ] Multiple device handling
  - [ ] Session timeout handling
  - [ ] Remember me functionality

## 2. Navigation & UI
- [ ] Responsive Design
  - [ ] Mobile view
  - [ ] Tablet view
  - [ ] Desktop view

Issues: Does not work resize properly. there are a lot of issues with the responsive design.

- [ ] Theme Switching
  - [ ] Dark/Light mode toggle
  - [ ] Theme persistence

Issues: We can toggle the theme but it does not persist.

- [ ] Navigation Menu
  - [ ] Mobile hamburger menu
  - [ ] Desktop navigation links
  - [ ] User avatar dropdown
  - [ ] Admin-specific menu items

Issues:
  - The hamburger works but when i click it (tap it) I want it to close again.
  - The desktop actualy works without issue, only thing i want is when we click the avatar dropdown it should open and when we click it again it should close.
  - The admin-specific menu, we never really added a feature as to how to make it work.

Additional Test Cases:
- [ ] Search Functionality
  - [ ] Search suggestions
  - [ ] Filter persistence
  - [ ] Search history
  - [ ] No results handling

- [ ] Accessibility
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast
  - [ ] Focus indicators

## 3. Product Browsing
- [ ] Product Listing
  - [ ] Grid view
  - [ ] List view
  - [ ] Image loading
  - [ ] Price display
  - [ ] Product details

- [ ] Product Details Page
  - [ ] Image display
  - [ ] Product information
  - [ ] Price
  - [ ] Stock status
  - [ ] Add to cart functionality

Additional Test Cases:
- [ ] Product Filtering
  - [ ] Price range filter
  - [ ] Category filter
  - [ ] Multiple filter combination
  - [ ] Filter clear/reset

- [ ] Product Sorting
  - [ ] Price (high/low)
  - [ ] Newest first
  - [ ] Best selling
  - [ ] Rating

## 4. Shopping Cart
- [ ] Cart Operations
  - [ ] Add items to cart
  - [ ] Update quantities
  - [ ] Remove items
  - [ ] Cart persistence after refresh
  - [ ] Price calculations

- [ ] Cart UI
  - [ ] Empty cart state
  - [ ] Cart item display
  - [ ] Subtotal calculation
  - [ ] Proceed to checkout button

issues: 
 - Product image doesn't show up in cart.

Additional Test Cases:
- [ ] Cart Features
  - [ ] Save for later
  - [ ] Move to wishlist
  - [ ] Quantity limitations
  - [ ] Stock validation

## 5. Checkout Process
- [ ] Shipping Address
  - [ ] Address selection
  - [ ] Multiple addresses support
  - [ ] Default address handling

- [ ] Payment Processing
  - [ ] Stripe integration
  - [ ] Payment form
  - [ ] Error handling
  - [ ] Success/failure redirects

Issues:
  - User runs into errors when trying to checkout. Is able to access checkout but runs into issues with the checkout success/failure redirects.

  - It works in the development environment but not in the production environment. i am talking about the stripe integration.

Additional Test Cases:
- [ ] Guest Checkout
  - [ ] Email validation
  - [ ] Convert to registered user
  - [ ] Order tracking access

- [ ] Order Review
  - [ ] Price breakdown
  - [ ] Shipping method selection
  - [ ] Discount code application
  - [ ] Tax calculation

## 6. Order Management
- [ ] Order Creation
  - [ ] Order confirmation
  - [ ] Email notifications
  - [ ] Stock updates

Issues:
  - The order is created and added.
  - There is no email notification, this feature has never been created.

- [ ] Order History
  - [ ] Order listing
  - [ ] Order details view
  - [ ] Order status display

Additional Test Cases:
- [ ] Order Tracking
  - [ ] Status updates
  - [ ] Shipping tracking integration
  - [ ] Delivery estimates
  - [ ] Order modifications

## 7. Admin Features
- [ ] Product Management
  - [ ] Add new products
  - [ ] Edit existing products
  - [ ] Delete products
  - [ ] Image upload
  - [ ] Stock management

- [ ] Dashboard
  - [ ] Sales metrics
  - [ ] User statistics
  - [ ] Product inventory
  - [ ] Recent orders

Issues:
  - We have a very basic dashboard. It works fine but it is not very useful. It only show:
    - Total orders
    - Total Users
    - Total Products
    - Recent orders
  So yes, it "meets" the requirements but it is not very useful.
  - We have a lot of features that we can add to the dashboard but we never really added them.

Additional Test Cases:
- [ ] Advanced Analytics
  - [ ] Sales forecasting
  - [ ] Inventory predictions
  - [ ] Customer segmentation
  - [ ] Performance metrics

- [ ] Bulk Operations
  - [ ] Product import/export
  - [ ] Price updates
  - [ ] Stock adjustments
  - [ ] Order processing

## 8. Error Handling
- [ ] API Errors
  - [ ] Network error handling
  - [ ] Invalid input handling
  - [ ] Server error handling
  - [ ] User-friendly error messages

Additional Test Cases:
- [ ] Recovery Scenarios
  - [ ] Cart recovery
  - [ ] Form data persistence
  - [ ] Session recovery
  - [ ] Connection retry

## 9. Performance
- [ ] Page Load Times
  - [ ] Initial load
  - [ ] Navigation between pages
  - [ ] Image optimization
  - [ ] API response times

  Issues:
    - The webapp is not very fast in general.

Additional Test Cases:
- [ ] Optimization
  - [ ] Image lazy loading
  - [ ] Code splitting
  - [ ] API response caching
  - [ ] Bundle size optimization

## 10. Security
- [ ] Authentication
  - [ ] Token expiration
  - [ ] Protected routes
  - [ ] Admin route protection

- [ ] Data Validation
  - [ ] Input sanitization
  - [ ] Form validation
  - [ ] API payload validation

Additional Test Cases:
- [ ] Advanced Security
  - [ ] Rate limiting
  - [ ] CSRF protection
  - [ ] SQL injection prevention
  - [ ] XSS protection

## 11. Analytics & Reporting
- [ ] User Behavior
  - [ ] Page view tracking
  - [ ] Click tracking
  - [ ] Session duration
  - [ ] Bounce rate

- [ ] Business Metrics
  - [ ] Conversion rate
  - [ ] Average order value
  - [ ] Customer lifetime value
  - [ ] Return customer rate

## 12. Mobile Experience
- [ ] Mobile Features
  - [ ] Touch gestures
  - [ ] Mobile navigation
  - [ ] App-like experience
  - [ ] Offline capabilities

## 13. Integration Testing
- [ ] Third-party Services
  - [ ] Payment gateway
  - [ ] Email service
  - [ ] Analytics tools
  - [ ] Shipping calculators

## Notes:
- Mark each item with [x] when tested successfully
- Add comments or issues found during testing below each section
- Document any bugs or unexpected behavior
- Test on multiple devices and browsers
- Include performance metrics where applicable
- Document any security concerns immediately
 