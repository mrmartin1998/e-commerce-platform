# 🧪 Order Tracking System - Manual Testing Guide

**Feature:** Complete Order Tracking System with Status History  
**Date:** January 13, 2026  
**Tester:** Martin Emil Brabenec  
**Status:** 🟡 In Progress

---

## 📋 Pre-Testing Setup

### Requirements Checklist
- [ ] Development server running (`npm run dev`)
- [ ] MongoDB connected and accessible
- [ ] At least one test order in database
- [ ] Admin account ready (email: _____________, password: _______)
- [ ] Regular user account ready (email: _____________, password: _______)
- [ ] Two browser windows/tabs open (admin + user)

### Test Data Needed
- [ ] Order ID to test: `_________________________________`
- [ ] Initial order status: `_________________________________`
- [ ] Customer who owns order: `_________________________________`

---

## 🔧 Test Scenario 1: Admin Status Update Modal

**Goal:** Verify admin can update order status using the new confirmation modal

### Test Steps

#### Step 1.1: Navigate to Admin Orders Page
- [ ] Navigate to `/admin/orders`
- [ ] Page loads successfully
- [ ] Orders table displays

**✅ Expected Results:**
- Status displays as **colored badge** (not dropdown)
- "Update Status" button visible for each order
- "View Details" button visible

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

#### Step 1.2: Open Status Update Modal
- [ ] Click "Update Status" button on test order
- [ ] Modal opens

**✅ Expected Results:**
- Modal displays current order information (ID, customer, status)
- Status dropdown shows all 5 options
- Note field (textarea) visible
- Cancel and Update buttons present

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

#### Step 1.3: Test Invalid Transition (No Changes)
- [ ] Select same status as current
- [ ] Click "Update Status"

**✅ Expected Results:**
- Error message: "No changes to save..."
- Status does NOT update
- Modal stays open

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

#### Step 1.4: Valid Status Update to "Processing"
- [ ] Select "processing" status
- [ ] Add note: "Payment confirmed, preparing order"
- [ ] Click "Update Status"

**✅ Expected Results:**
- Loading spinner appears
- Modal closes after success
- Status badge updates to "processing"
- Badge color changes to cyan/info color
- No errors in console

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

#### Step 1.5: View Order Details (Check History)
- [ ] Click "View Details" on same order
- [ ] Order details modal opens

**✅ Expected Results:**
- "Status History" section visible
- Shows 2 entries (initial "pending" + "processing")
- Your note appears: "Payment confirmed, preparing order"
- Shows admin name/email who made change
- Timestamps are accurate and formatted nicely
- Chronological order (oldest to newest)

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

#### Step 1.6: Update to "Shipped" with Tracking Info
- [ ] Close details modal
- [ ] Click "Update Status" again
- [ ] Select "shipped" status

**✅ Expected Results:**
- Shipping information fields appear:
  * Carrier dropdown (UPS, FedEx, USPS, DHL, Other)
  * Tracking URL input
  * Estimated Delivery date picker

**Fill in tracking information:**
- [ ] Carrier: "UPS"
- [ ] Tracking URL: `https://www.ups.com/track?tracknum=1Z999AA10123456784`
- [ ] Estimated Delivery: [Pick a future date]
- [ ] Note: "Package picked up by UPS driver"
- [ ] Click "Update Status"

**✅ Expected Results:**
- Update succeeds
- Status badge changes to "shipped" (blue/primary color)
- No errors

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

#### Step 1.7: Verify Tracking Info in Details
- [ ] Click "View Details" again
- [ ] Details modal opens

**✅ Expected Results:**
- "Shipping Information" section displays
- Carrier shows: "UPS"
- Tracking link is present and clickable
- Estimated delivery date displays
- Status history now has 3 entries
- Latest entry shows tracking note

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

## 🚫 Test Scenario 2: Status Transition Validation

**Goal:** Verify API prevents invalid status changes

### Test 2.1: Backward Transition (Should Fail)
- [ ] Order currently at "shipped"
- [ ] Try to change back to "processing"
- [ ] Click "Update Status"

**✅ Expected Results:**
- Error message: "Cannot move status backward from shipped to processing"
- Status does NOT change
- Order remains "shipped"

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 2.2: Delivered Order Protection
- [ ] Update order to "delivered"
- [ ] Try to change to ANY other status
- [ ] Click "Update Status"

**✅ Expected Results:**
- Error message: "Cannot change status of delivered orders"
- Status remains "delivered"
- Modal shows error

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 2.3: Cancelled Order Protection
- [ ] Find/create order at "processing"
- [ ] Change to "cancelled"
- [ ] Verify update succeeds
- [ ] Try to change cancelled order to any status

**✅ Expected Results:**
- Cancellation from "processing" works ✅
- Error: "Cannot change status of cancelled orders" when trying to modify
- Order stays "cancelled"

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 2.4: Cancellation Special Case
- [ ] Find order at "pending" or "processing"
- [ ] Change to "cancelled"
- [ ] Verify it works

**✅ Expected Results:**
- Cancellation allowed from any non-final status
- Status updates to "cancelled" (red badge)
- History logs the cancellation

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

## 👥 Test Scenario 3: Customer View (Timeline)

**Goal:** Verify customers see beautiful, informative timeline

### Test 3.1: Navigate to Order Details
- [ ] Switch to customer browser window
- [ ] Login as customer who owns the order
- [ ] Navigate to `/orders`
- [ ] Click on test order

**✅ Expected Results:**
- Order details page loads
- Timeline component displays
- No errors in console

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 3.2: Visual Timeline Elements
**Check the following visual elements:**

- [ ] **Timeline structure displays**
  - Vertical line connecting status points
  - Status icons visible (📝, ⚙️, 📦, ✅, ❌)

- [ ] **Completed statuses**
  - Green checkmarks for completed
  - "✓ Complete" label

- [ ] **Current status**
  - **Pulse animation** on current status
  - Highlighted/bold
  - "In progress" label

- [ ] **Future statuses**
  - Grayed out appearance
  - No checkmarks

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 3.3: Timestamps and Formatting
- [ ] Each entry shows date/time
- [ ] Format: "January 13, 2026 at 2:30 PM" (or similar)
- [ ] Relative time: "2 hours ago" or "Just now"
- [ ] Chronological order (oldest to newest)

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 3.4: Shipping Information Section
**Only visible if order has tracking info:**

- [ ] "📦 Shipping Information" section displays
- [ ] Carrier name shows: "UPS"
- [ ] Tracking link: "Track Package ↗"
- [ ] Click link - opens in **new tab**
- [ ] Estimated delivery formatted: "Wednesday, January 15, 2026" (with weekday)

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 3.5: Privacy/Security Checks
- [ ] Admin names are **NOT visible** to customer
- [ ] Only timestamps and notes display
- [ ] No sensitive admin information leaked

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

## 🎯 Test Scenario 4: Edge Cases

### Test 4.1: Order Without Tracking
- [ ] Find/create order at "pending" or "processing"
- [ ] View as customer

**✅ Expected Results:**
- Timeline displays correctly
- **NO** tracking information section
- No errors or broken layout
- Clean, professional appearance

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 4.2: Order With Minimal History
- [ ] Find very old order OR create new order
- [ ] Check if statusHistory is empty or minimal

**✅ Expected Results:**
- Component doesn't crash
- Shows at minimum the current status
- Graceful handling of missing data

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 4.3: Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Test on "iPhone 12 Pro" viewport
- [ ] Test on "iPad" viewport

**✅ Expected Results:**
- Timeline is readable on mobile
- Modal fits on screen
- Buttons are touchable (44px minimum)
- No horizontal scroll
- Text wraps appropriately

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 4.4: Long Text/Overflow Handling
- [ ] Add very long note (200+ characters)
- [ ] Add very long tracking URL

**✅ Expected Results:**
- Text wraps properly
- No layout breaking
- Scrollable if needed
- Readable on all screen sizes

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

## 💾 Test Scenario 5: Database Verification

### Test 5.1: MongoDB Data Structure
**Using MongoDB Compass or similar:**

- [ ] Connect to database
- [ ] Open `orders` collection
- [ ] Find test order document

**Check the following fields exist and are correct:**

- [ ] `statusHistory` array exists
- [ ] Array has multiple entries (matching updates made)
- [ ] Each entry has:
  * `status` (string)
  * `timestamp` (Date)
  * `updatedBy` (ObjectId reference)
  * `note` (string)
- [ ] `trackingUrl` field populated
- [ ] `carrier` field populated
- [ ] `estimatedDelivery` field populated (Date)
- [ ] `updatedAt` timestamp is recent

**📝 Database Screenshot or Notes:**
```
[Paste database document or write observations]




```

---

## 🎨 Test Scenario 6: UI/UX Polish

### Test 6.1: Color Coding Consistency
**Check status badge colors:**

- [ ] **Pending** → Yellow (badge-warning)
- [ ] **Processing** → Cyan (badge-info)
- [ ] **Shipped** → Blue (badge-primary)
- [ ] **Delivered** → Green (badge-success)
- [ ] **Cancelled** → Red (badge-error)

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 6.2: Loading States
- [ ] Update status and watch for loading spinner
- [ ] Buttons disabled during loading
- [ ] Text changes to "Updating..."

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

### Test 6.3: Form Validation
- [ ] Try submitting empty note (should work - it's optional)
- [ ] Try invalid tracking URL format
- [ ] Try past date for estimated delivery

**📝 Notes/Issues:**
```
[Write any issues here]




```

---

## 🐛 Bug Tracker

### Critical Bugs 🔴
```
[List any critical bugs that prevent core functionality]

1. 

2. 

3. 
```

### Major Bugs 🟠
```
[List bugs that impact user experience significantly]

1. 

2. 

3. 
```

### Minor Bugs 🟡
```
[List cosmetic or minor issues]

1. 

2. 

3. 
```

### Enhancements/Nice-to-Have 🔵
```
[List potential improvements or polish items]

1. 

2. 

3. 
```

---

## ✅ Final Testing Checklist

### Admin Functionality
- [ ] Can open status update modal
- [ ] Can select new status
- [ ] Can add optional note
- [ ] Shipping fields appear for "shipped" status
- [ ] Can add tracking URL, carrier, delivery date
- [ ] Validation prevents invalid transitions
- [ ] Status badge updates after change
- [ ] View Details shows complete status history
- [ ] Admin name appears in history entries

### Customer Experience
- [ ] Timeline component displays correctly
- [ ] Shows chronological status changes
- [ ] Visual indicators work (icons, colors, animations)
- [ ] Pulse animation on current status
- [ ] Tracking section shows when available
- [ ] Tracking link opens in new tab with security attributes
- [ ] Estimated delivery formatted nicely
- [ ] Admin names hidden from customer view
- [ ] Mobile responsive

### Data Integrity
- [ ] statusHistory saves correctly in database
- [ ] Each entry has all required fields
- [ ] Tracking fields save properly
- [ ] updatedAt timestamp updates
- [ ] No data loss or corruption

### Performance
- [ ] Pages load quickly (< 2 seconds)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Animations smooth
- [ ] API calls complete successfully

---

## 📊 Test Summary

**Total Tests Planned:** 50+  
**Tests Passed:** _____ / _____  
**Tests Failed:** _____  
**Bugs Found:** _____  
**Critical Issues:** _____  

### Overall Status
- [ ] ✅ All tests passed - Ready for commit
- [ ] ⚠️ Minor issues found - Needs fixes before commit
- [ ] ❌ Critical issues found - Cannot commit yet

### Next Steps
```
[Write your next steps here]

1. Fix critical bug: ___________________________________

2. Address minor issues: ___________________________________

3. Retest failed scenarios: ___________________________________

4. Create final commit with message
```

---

## 📸 Screenshots for Portfolio

**Take screenshots of the following:**

- [ ] Admin orders page with colored badges
- [ ] Status update modal with tracking fields
- [ ] Order details showing status history
- [ ] Customer timeline view (desktop)
- [ ] Customer timeline view (mobile)
- [ ] Tracking information section

**Screenshot locations:** `_________________________________`

---

## 🎓 Key Learnings

**What worked well:**
```
[Document what went smoothly]




```

**What was challenging:**
```
[Document difficulties encountered]




```

**What would you improve:**
```
[Ideas for future enhancements]




```

---

**Testing Completed:** _____ / _____ / ______  
**Tested By:** Martin Emil Brabenec  
**Ready for Production:** [ ] Yes  [ ] No  [ ] Needs Review
