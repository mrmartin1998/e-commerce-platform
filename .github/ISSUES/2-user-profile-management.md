# User Profile Management

## Requirements
### User Story
"As a user, I want to manage my profile information so that I can easily apply for visas and track my applications"

### Acceptance Criteria
- [ ] Users can view their profile details
- [ ] Users can update their:
  - Personal Information
  - Contact Details
  - Passport Information
  - Communication preferences
- [ ] Users can view their application history
- [ ] Users can track application status
- [ ] All changes require authentication
- [ ] Email changes require verification

## Technical Design

### Backend Changes
#### Models
- Update User Model:  ```javascript
  {
    personal_info: {
      full_name: String,
      date_of_birth: Date,
      nationality: String,
      passport_number: String,
      passport_expiry: Date
    },
    contact_info: {
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    },
    preferences: {
      notifications: Boolean,
      language: String
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }]
  }  ```

#### Controllers
- ProfileController:
  - getProfile
  - updateProfile
  - updatePassportInfo
  - getApplicationHistory
  - updateContactInfo

#### Routes
- GET /api/profile
- PUT /api/profile
- GET /api/profile/applications
- PUT /api/profile/passport
- PUT /api/profile/contact

### Frontend Changes
#### Components
- ProfileLayout
- ProfileForm
- PassportInfoForm
- ApplicationHistoryList
- ContactInfoForm
- StatusTracker

#### Services
- profileService:
  - Profile CRUD operations
  - Application history retrieval
  - Status tracking
  - Document management

### Dependencies
- Authentication System (#1)
- Document Upload System (#10)
- Application Status System 