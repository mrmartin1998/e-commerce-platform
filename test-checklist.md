# E-Commerce Platform Test Checklist

## 1. Authentication & User Management
- [x] User Registration
  - [x] Register with valid credentials
  - [x] Validate email format
  - [x] Password confirmation match
  - [x] Error handling for existing email

- [x] User Login
  - [x] Login with valid credentials
  - [x] Error handling for invalid credentials
  - [x] Token storage in localStorage
  - [x] Persistence of login state after refresh

- [x] User Logout
  - [x] Clean logout
  - [x] Token removal
  - [x] Redirect to home page

General auth issues:
  - After logging in the token only lasts for a few minutes after that it expires.

## 2. Navigation & UI
- [x] Responsive Design
  - [x] Mobile view
  - [x] Tablet view
  - [x] Desktop view

Issues: Does not work resize properly. there are a lot of issues with the responsive design.

- [x] Theme Switching
  - [x] Dark/Light mode toggle
  - [x] Theme persistence

Issues: We can toggle the theme but it does not persist.

- [x] Navigation Menu
  - [x] Mobile hamburger menu
  - [x] Desktop navigation links
  - [x] User avatar dropdown
  - [x] Admin-specific menu items

Issues:
  - The hamburger works but when i click it (tap it) I want it to close again.
  - The desktop actualy works without issue, only thing i want is when we click the avatar dropdown it should open and when we click it again it should close.
  - The admin-specific menu, we never really added a feature as to how to make it work.

## 3. Product Browsing
- [x] Product Listing
  - [x] Grid view
  - [x] List view
  - [x] Image loading
  - [x] Price display
  - [x] Product details

- [x] Product Details Page
  - [x] Image display
  - [x] Product information
  - [x] Price
  - [x] Stock status
  - [x] Add to cart functionality

## 4. Shopping Cart
- [x] Cart Operations
  - [x] Add items to cart
  - [x] Update quantities
  - [x] Remove items
  - [x] Cart persistence after refresh
  - [x] Price calculations

- [x] Cart UI
  - [x] Empty cart state
  - [x] Cart item display
  - [x] Subtotal calculation
  - [x] Proceed to checkout button

issues: 
 - Product image doesn't show up in cart.

## 5. Checkout Process
- [x] Shipping Address
  - [x] Address selection
  - [x] Multiple addresses support
  - [x] Default address handling

- [x] Payment Processing
  - [x] Stripe integration
  - [x] Payment form
  - [x] Error handling
  - [x] Success/failure redirects

Issues:
  - User runs into errors when trying to checkout. Is able to access checkout but runs into issues with the checkout success/failure redirects.

  - It works in the development environment but not in the production environment. i am talking about the stripe integration.

## 6. Order Management
- [x] Order Creation
  - [x] Order confirmation
  - [x] Email notifications
  - [x] Stock updates

Issues:
  - The order is created and added.
  - There is no email notification, this feature has never been created.

- [x] Order History
  - [x] Order listing
  - [x] Order details view
  - [x] Order status display

## 7. Admin Features
- [x] Product Management
  - [x] Add new products
  - [x] Edit existing products
  - [x] Delete products
  - [x] Image upload
  - [x] Stock management

- [x] Dashboard
  - [x] Sales metrics
  - [x] User statistics
  - [x] Product inventory
  - [x] Recent orders

Issues:
  - We have a very basic dashboard. It works fine but it is not very useful. It only show:
    - Total orders
    - Total Users
    - Total Products
    - Recent orders
  So yes, it "meets" the requirements but it is not very useful.
  - We have a lot of features that we can add to the dashboard but we never really added them.

## 8. Error Handling
- [x] API Errors
  - [x] Network error handling
  - [x] Invalid input handling
  - [x] Server error handling
  - [x] User-friendly error messages

## 9. Performance
- [x] Page Load Times
  - [x] Initial load
  - [x] Navigation between pages
  - [x] Image optimization
  - [x] API response times

  Issues:
    - The webapp is not very fast in general.

## 10. Security
- [x] Authentication
  - [x] Token expiration
  - [x] Protected routes
  - [x] Admin route protection

- [x] Data Validation
  - [x] Input sanitization
  - [x] Form validation
  - [x] API payload validation

## 11. Cross-browser Testing
- [x] Browser Compatibility
  - [x] Chrome
  - [x] Firefox
  - [x] Safari
  - [x] Edge

## Notes:
- Mark each item with [x] when tested successfully
- Add comments or issues found during testing below each section
- Document any bugs or unexpected behavior
- Test on multiple devices when possible 