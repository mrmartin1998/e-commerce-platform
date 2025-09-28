# Authentication System

## Requirements
### User Story
"As a user, I want to securely access my account so that I can manage my visa applications"

### Acceptance Criteria
- [ ] Users can register with email verification
- [ ] Users can login securely
- [ ] Users can reset passwords
- [ ] JWT tokens are properly managed
- [ ] Rate limiting is implemented
- [ ] Session management is secure
- [ ] Role-based access (admin/user)

## Technical Design

### Backend Changes
#### Models
- Update User Model:  ```javascript
  {
    email: String,
    password: String,
    email_verified: Boolean,
    verification_token: String,
    reset_token: String,
    reset_token_expiry: Date,
    last_login: Date,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: String
  }  ```

#### Controllers
- AuthController:
  - Email verification
  - Password reset
  - Token refresh
  - Session management
  - Role verification

#### Routes
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-email
- POST /api/auth/reset-password
- POST /api/auth/refresh-token
- GET /api/auth/me

### Frontend Changes
#### Components
- AuthLayout
- LoginForm
- RegisterForm
- ResetPasswordForm
- EmailVerificationForm
- ProtectedRoute

#### Services
- authService:
  - Token management
  - Session handling
  - Role-based routing
  - API integration

### Dependencies
- Next.js API Routes setup ✅
- Email service setup
- JWT configuration
