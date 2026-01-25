# Email Notifications Implementation Guide
**Issue #11: Add Email Notification System**

---

## 📋 Overview

Implement automated email notifications for order-related events using Resend email service. This will provide professional customer communication throughout the order lifecycle.

**Branch**: `feature/email-notifications`

**Estimated Time**: 4-6 hours

**Email Provider**: Resend (simple, modern, developer-friendly)

**Template Approach**: Clean HTML with inline CSS (balance of professional + simple)

---

## 🎯 Goals

- ✅ Send order confirmation emails after successful payment
- ✅ Send status update emails when admin changes order status
- ✅ Professional, mobile-friendly email templates
- ✅ Graceful error handling (email failures don't block orders)
- ✅ Development testing with real emails

---

## 📦 Tasks Breakdown

### **Task 1: Setup Resend & Environment Configuration** (30 minutes)

**What we'll do**:
1. Install Resend package
2. Create Resend account and get API key
3. Add environment variables
4. Create email service utility structure

**Files to create**:
- `src/lib/email/emailService.js` - Main email service
- `src/lib/email/index.js` - Exports

**Environment Variables to add** (`.env.local`):
```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
EMAIL_TEST_RECIPIENT=your-email@gmail.com
NODE_ENV=development
```

**Package to install**:
```bash
npm install resend
```

**Acceptance Criteria**:
- [x] Resend package installed
- [x] API key configured
- [x] Email service file structure created
- [x] Environment variables documented

---

### **Task 2: Create Email Templates** (1-2 hours)

**What we'll do**:
Create professional HTML email templates with inline CSS for maximum compatibility.

**Files to create**:
- `src/lib/email/templates/orderConfirmation.js`
- `src/lib/email/templates/orderProcessing.js`
- `src/lib/email/templates/orderShipped.js`
- `src/lib/email/templates/orderDelivered.js`
- `src/lib/email/templates/orderCancelled.js`
- `src/lib/email/templates/baseTemplate.js` (shared header/footer)

**Template Features**:
- Mobile-responsive design
- Inline CSS (works in all email clients)
- Professional branding
- Dynamic content (order details, tracking info, etc.)
- Clear call-to-action buttons

**Data each template needs**:

**Order Confirmation**:
- Order ID
- Order items (name, quantity, price, images)
- Subtotal, tax, shipping, total
- Shipping address
- Payment method (last 4 digits)
- Order date

**Order Processing**:
- Order ID
- Estimated processing time
- Items being prepared

**Order Shipped**:
- Order ID
- Tracking URL
- Carrier name
- Estimated delivery date
- Items shipped

**Order Delivered**:
- Order ID
- Delivery confirmation
- Request for review/feedback

**Order Cancelled**:
- Order ID
- Cancellation reason
- Refund information
- Items cancelled

**Acceptance Criteria**:
- [x] All 5 email templates created
- [x] Base template with consistent header/footer
- [x] Templates are mobile-responsive
- [x] All dynamic data properly interpolated
- [x] Professional styling with inline CSS

---

### **Task 3: Implement Email Service Functions** (1 hour)

**What we'll do**:
Create reusable functions for sending different types of emails.

**File**: `src/lib/email/emailService.js`

**Functions to implement**:
```javascript
// Core sending function
async function sendEmail(to, subject, html)

// Specific email functions
async function sendOrderConfirmation(order, customerEmail)
async function sendOrderProcessing(order, customerEmail)
async function sendOrderShipped(order, customerEmail)
async function sendOrderDelivered(order, customerEmail)
async function sendOrderCancelled(order, customerEmail)
```

**Features**:
- Development mode: All emails go to `EMAIL_TEST_RECIPIENT`
- Production mode: Emails go to actual customer
- Error handling: Log errors, don't throw (graceful degradation)
- Success logging for debugging

**Error Handling Strategy**:
```javascript
try {
  await resend.emails.send({ ... });
  console.log('✅ Email sent successfully');
} catch (error) {
  console.error('❌ Email failed:', error.message);
  // Don't throw - order processing continues
}
```

**Acceptance Criteria**:
- [x] All email functions implemented
- [x] Development mode sends to test email
- [x] Production mode sends to customer email
- [x] Graceful error handling
- [x] Success/failure logging

---

### **Task 4: Integrate Order Confirmation Email** (1 hour)

**What we'll do**:
Add email sending to the Stripe payment webhook.

**File to modify**: `src/app/api/payment/webhook/route.js`

**Integration point**:
After `checkout.session.completed` event successfully creates order.

**Steps**:
1. Import email service
2. Get customer email from order/user data
3. Call `sendOrderConfirmation(order, customerEmail)`
4. Handle any errors gracefully

**Code location**:
```javascript
// After order is created successfully
const order = await Order.create({ ... });

// Send confirmation email (new code)
try {
  await sendOrderConfirmation(order, customerEmail);
} catch (error) {
  console.error('Email failed:', error);
  // Continue - order is already created
}
```

**Data needed**:
- Order object (with populated items)
- Customer email (from userId or session metadata)

**Acceptance Criteria**:
- [x] Email sent after successful payment
- [x] Customer receives order confirmation
- [x] Email contains all order details
- [x] Email failure doesn't break payment flow
- [x] Tested with real Stripe payment

---

### **Task 5: Integrate Status Update Emails** (1 hour)

**What we'll do**:
Add email sending to admin order status update endpoint.

**File to modify**: `src/app/api/admin/orders/[orderId]/route.js`

**Integration point**:
After admin successfully updates order status in PATCH handler.

**Email triggers based on status**:
- `processing` → Send "Order Processing" email
- `shipped` → Send "Order Shipped" email (with tracking)
- `delivered` → Send "Order Delivered" email
- `cancelled` → Send "Order Cancelled" email

**Code location**:
```javascript
// After order.save() succeeds
await order.save();

// Send appropriate status email (new code)
const customerEmail = order.userId.email;

switch (order.status) {
  case 'processing':
    await sendOrderProcessing(order, customerEmail);
    break;
  case 'shipped':
    await sendOrderShipped(order, customerEmail);
    break;
  case 'delivered':
    await sendOrderDelivered(order, customerEmail);
    break;
  case 'cancelled':
    await sendOrderCancelled(order, customerEmail);
    break;
}
```

**Note**: We need to ensure `userId` is populated before sending email.

**Acceptance Criteria**:
- [x] Correct email sent for each status change
- [x] Tracking information included in shipped email
- [x] Email failure doesn't break status update
- [x] Only sends email for actual status changes
- [x] Tested with all status transitions

---

### **Task 6: Testing All Email Templates** (1 hour)

**What we'll do**:
Comprehensive testing of all email scenarios.

**Test Scenarios**:

**1. Order Confirmation Email**:
- [ ] Create test order via Stripe checkout
- [ ] Verify email received at test address
- [ ] Check all order details are correct
- [ ] Verify images load properly
- [ ] Test on desktop and mobile email clients

**2. Order Processing Email**:
- [ ] Admin updates order to "processing"
- [ ] Verify email received
- [ ] Check content is appropriate
- [ ] Verify mobile responsiveness

**3. Order Shipped Email**:
- [ ] Admin updates order to "shipped" with tracking
- [ ] Verify email includes tracking URL
- [ ] Verify carrier name displays
- [ ] Verify estimated delivery date shows
- [ ] Test tracking link works

**4. Order Delivered Email**:
- [ ] Admin updates order to "delivered"
- [ ] Verify email received
- [ ] Check delivery confirmation message
- [ ] Verify review/feedback CTA

**5. Order Cancelled Email**:
- [ ] Admin cancels order
- [ ] Verify email received
- [ ] Check cancellation message
- [ ] Verify refund information

**Error Handling Tests**:
- [ ] Test with invalid API key (should log error, not crash)
- [ ] Test with missing customer email (should handle gracefully)
- [ ] Test with Resend service down (should continue processing)

**Email Client Compatibility**:
- [ ] Gmail (desktop)
- [ ] Gmail (mobile app)
- [ ] Outlook
- [ ] Apple Mail
- [ ] Dark mode rendering

**Acceptance Criteria**:
- [x] All email types tested successfully
- [x] Emails render correctly on mobile
- [x] All dynamic data populates correctly
- [x] Links work properly
- [x] Error scenarios handled gracefully
- [x] No blocking issues found

---

## 📂 File Structure

```
src/lib/email/
├── emailService.js              # Main service with send functions
├── index.js                     # Exports
└── templates/
    ├── baseTemplate.js          # Shared header/footer wrapper
    ├── orderConfirmation.js     # Order placed template
    ├── orderProcessing.js       # Order processing template
    ├── orderShipped.js          # Shipping notification template
    ├── orderDelivered.js        # Delivery confirmation template
    └── orderCancelled.js        # Cancellation notice template
```

---

## 🔧 Environment Setup

### Development Environment Variables

Add to `.env.local`:
```env
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
EMAIL_TEST_RECIPIENT=your-email@gmail.com
NODE_ENV=development
```

### Production Environment Variables

Add to Vercel/deployment platform:
```env
RESEND_API_KEY=re_your_production_api_key
EMAIL_FROM=orders@yourdomain.com  # Or onboarding@resend.dev
NODE_ENV=production
```

---

## 📧 Email Triggers Summary

| Event | Trigger Location | Email Type | Template |
|-------|-----------------|------------|----------|
| Payment Success | `/api/payment/webhook` | Order Confirmation | `orderConfirmation.js` |
| Status → Processing | `/api/admin/orders/[orderId]` | Order Processing | `orderProcessing.js` |
| Status → Shipped | `/api/admin/orders/[orderId]` | Shipping Notification | `orderShipped.js` |
| Status → Delivered | `/api/admin/orders/[orderId]` | Delivery Confirmation | `orderDelivered.js` |
| Status → Cancelled | `/api/admin/orders/[orderId]` | Cancellation Notice | `orderCancelled.js` |

---

## 🎨 Email Design Guidelines

**Styling Principles**:
- Use inline CSS for maximum compatibility
- Mobile-first responsive design
- Professional color scheme (match brand)
- Clear typography hierarchy
- Prominent call-to-action buttons
- Alt text for all images

**Email Width**:
- Max width: 600px (standard for email clients)
- Min width: 320px (mobile devices)

**Color Palette** (suggestions):
- Primary: #3B82F6 (blue for buttons/links)
- Success: #10B981 (green for confirmations)
- Warning: #F59E0B (yellow for processing)
- Error: #EF4444 (red for cancellations)
- Background: #F3F4F6 (light gray)
- Text: #111827 (dark gray)

**Typography**:
- Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Headings: 24px, bold
- Body: 16px, regular
- Small text: 14px, regular

---

## ⚠️ Important Notes

### Data Population Requirements

**Order Confirmation Email** needs:
- Order with populated `items.productId` (name, images, price)
- User data (email, name)

**Status Update Emails** need:
- Order with populated `userId` (email, name)
- Order tracking information (trackingUrl, carrier, estimatedDelivery)

**Ensure these are populated** before passing to email functions!

### Error Handling Philosophy

**Email failures should NEVER block order processing**:
- Orders can be processed without email confirmation
- Log all email errors for debugging
- Don't throw errors - use try/catch
- Consider adding email retry queue in future (optional)

### Development vs Production

**Development Mode** (`NODE_ENV=development`):
- All emails sent to `EMAIL_TEST_RECIPIENT`
- Allows testing without spamming customers
- Email subject prefixed with `[TEST]`

**Production Mode** (`NODE_ENV=production`):
- Emails sent to actual customer addresses
- No test prefixes
- Use production Resend API key

---

## 🧪 Testing Checklist

### Setup Testing
- [ ] Resend package installed successfully
- [ ] API key configured and working
- [ ] Environment variables loaded correctly
- [ ] Can send test email successfully

### Template Testing
- [ ] Order confirmation renders correctly
- [ ] Processing notification renders correctly
- [ ] Shipping notification renders correctly
- [ ] Delivery confirmation renders correctly
- [ ] Cancellation notice renders correctly
- [ ] All templates mobile-responsive
- [ ] Images load properly in emails
- [ ] Links work in all templates

### Integration Testing
- [ ] Payment webhook sends confirmation email
- [ ] Processing status triggers processing email
- [ ] Shipped status triggers shipping email
- [ ] Delivered status triggers delivery email
- [ ] Cancelled status triggers cancellation email
- [ ] All dynamic data populates correctly
- [ ] Tracking links work in shipped email

### Error Handling Testing
- [ ] Invalid API key handled gracefully
- [ ] Missing email address handled gracefully
- [ ] Resend service error handled gracefully
- [ ] Order processing continues despite email failure

### Email Client Testing
- [ ] Gmail desktop renders correctly
- [ ] Gmail mobile renders correctly
- [ ] Outlook renders correctly
- [ ] Apple Mail renders correctly
- [ ] Dark mode looks acceptable

---

## 🚀 Implementation Order

**Recommended sequence**:

1. **Setup** (Task 1)
   - Install Resend
   - Configure environment
   - Create service structure

2. **Templates** (Task 2)
   - Start with base template
   - Create order confirmation (most important)
   - Create status update templates
   - Test each template in isolation

3. **Service Functions** (Task 3)
   - Implement core send function
   - Implement specific email functions
   - Test error handling

4. **Payment Integration** (Task 4)
   - Add to webhook
   - Test with real payment
   - Verify email received

5. **Status Integration** (Task 5)
   - Add to status update endpoint
   - Test each status transition
   - Verify appropriate emails sent

6. **Final Testing** (Task 6)
   - Comprehensive end-to-end testing
   - Email client compatibility
   - Error scenario testing

---

## 📝 Commit Strategy

**Suggested commits** (one per task):

1. `feat: setup Resend email service and environment configuration`
2. `feat: create professional email templates for order notifications`
3. `feat: implement email service functions with error handling`
4. `feat: integrate order confirmation email in payment webhook`
5. `feat: integrate status update emails in admin order endpoint`
6. `test: comprehensive testing of email notification system`

Final commit:
```
feat: implement complete email notification system

Integrated Resend email service for automated order notifications:
- Order confirmation after successful payment
- Status update emails (processing, shipped, delivered, cancelled)
- Professional mobile-responsive templates
- Graceful error handling
- Development and production modes

All emails tested and working correctly.
```

---

## 🎯 Acceptance Criteria Summary

**Core Functionality**:
- ✅ Order confirmation emails sent after payment
- ✅ Status update emails sent when admin changes status
- ✅ All email templates professional and mobile-friendly
- ✅ Tracking information included in shipping emails
- ✅ Error handling prevents emails from blocking orders

**Technical Requirements**:
- ✅ Resend integration working
- ✅ Environment variables configured
- ✅ Development mode uses test recipient
- ✅ Production mode uses actual customer emails
- ✅ All code documented with comments

**Testing**:
- ✅ All email scenarios tested
- ✅ Email client compatibility verified
- ✅ Error scenarios handled gracefully
- ✅ No blocking issues found

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email HTML Best Practices](https://www.campaignmonitor.com/css/)
- [Mobile Email Design Guidelines](https://litmus.com/blog/the-ultimate-guide-to-responsive-email-design)

---

**Last Updated**: January 15, 2026
**Status**: Ready for Implementation
**Next Step**: Review task breakdown and begin Task 1
