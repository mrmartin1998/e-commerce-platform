# Tailandia Visa Form

## Requirements
### User Story
"As a user, I want to apply for a tourist visa to Thailand through a simple and guided form process"

### Acceptance Criteria
- [ ] User can complete visa application form with all required fields
- [ ] User can save progress and return later
- [ ] User can upload required documents (passport photo, passport scan, etc.)
- [ ] User can review application before submission
- [ ] User can make payment for visa application
- [ ] User receives confirmation email after submission
- [ ] User can track application status

## Technical Design

### Backend Changes
#### Models
- Thailand Application Model:  ```javascript
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personalInfo: {
      fullName: String,
      nationality: String,
      dateOfBirth: Date,
      email: String,
      phone: String,
      residentialAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    },
    employmentInfo: {
      currentOccupation: String,
      companyDetails: {
        name: String,
        address: String,
        phone: String
      }
    },
    passportDetails: {
      passportNumber: String,
      issueDate: Date,
      expiryDate: Date
    },
    documents: {
      passportPhoto: {
        url: String,
        uploadDate: Date,
        verified: Boolean
      },
      passportScan: {
        url: String,
        uploadDate: Date,
        verified: Boolean
      },
      exitTicket: {
        url: String,
        uploadDate: Date,
        verified: Boolean
      },
      hotelReservation: {
        type: {
          type: String,
          enum: ['document', 'text'],
          required: true
        },
        content: String, // URL for document or text input
        uploadDate: Date,
        verified: Boolean
      }
    },
    consentAccepted: {
      type: Boolean,
      required: true,
      timestamp: Date
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'processing', 'ready', 'completed'],
      default: 'draft'
    },
    payment: {
      status: String,
      transactionId: String,
      amount: Number,
      date: Date
    },
    submissionDate: Date,
    lastUpdated: Date
  }  ```

#### Controllers
- ThailandVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - processPayment
  - updateStatus

#### Routes
- POST /api/visa/thailand
- PUT /api/visa/thailand/:id
- GET /api/visa/thailand/:id
- POST /api/visa/thailand/:id/submit
- POST /api/visa/thailand/:id/payment

### Frontend Changes
#### Components
- ThailandVisaForm
  - PersonalInfoStep
  - EmploymentInfoStep
  - PassportDetailsStep
  - DocumentUploadStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- DocumentUploader
- PaymentProcessor
- ApplicationReview

#### Services
- thailandVisaService:
  - Form state management
  - Document upload handling
  - Payment processing
  - Application submission
  - Progress tracking

### Dependencies
- Authentication System ✅ (#1)
- User Profile Management ✅ (#2)
- Document Upload System (#11)
- Storage Management (#13)
- Payment Processing (#14)

### Special Features
1. Flexible hotel reservation input (document or text)
2. Document size and type validation
3. Multi-step form progress saving
4. Comprehensive document verification system
