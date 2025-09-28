# Admin Dashboard

## Requirements
### User Story
"As an admin, I want to manage visa applications and users so that I can process visa requests efficiently"

### Acceptance Criteria
- [ ] Admin can view all visa applications
- [ ] Admin can update application status (pending, approved, rejected)
- [ ] Admin can view and verify uploaded documents
- [ ] Admin can manage user accounts
- [ ] Admin can view payment status
- [ ] Admin can generate basic reports
- [ ] Access restricted to admin role only

## Technical Design

### Backend Changes
#### Models
- Update Application Model:  ```javascript
  {
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  }  ```

- Update User Model:  ```javascript
  {
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active'
    }
  }  ```

#### Controllers
- AdminController:
  - getApplicationsList
  - updateApplicationStatus
  - getUsersList
  - getApplicationStats
  - verifyDocuments
  - getPaymentStatus

#### Routes
- GET /api/admin/applications
- PUT /api/admin/applications/:id/status
- GET /api/admin/users
- GET /api/admin/stats
- PUT /api/admin/documents/:id/verify
- GET /api/admin/payments

### Frontend Changes
#### Components
- AdminDashboard
  - ApplicationsTable
  - StatusUpdateModal
  - DocumentVerificationView
  - UserManagementTable
  - PaymentStatusView
  - StatsDisplay

#### Services
- adminService:
  - Application management
  - Document verification
  - User management
  - Stats compilation
  - Payment tracking

### Dependencies
- Authentication System ✅ (#1)
- User Profile Management ✅ (#2)
- Document Upload System (#10)
- Payment System (#13) 