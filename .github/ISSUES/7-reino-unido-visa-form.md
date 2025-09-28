# Reino Unido Visa Form

## Requirements
### User Story
"As a user, I want to apply for a UK tourist visa through a simple and guided form process"

### Acceptance Criteria
- [ ] User can complete multi-step visa application form
- [ ] User can save progress and return later
- [ ] User can upload required documents
- [ ] User can review application before submission
- [ ] User can make payment for visa application
- [ ] User receives confirmation email after submission
- [ ] User can track application status

## Technical Design

### Backend Changes
#### Models
- Reino Unido Application Model:  ```javascript
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personalInfo: {
      fullName: String,
      dateOfBirth: Date,
      birthPlace: String,
      nationality: String,
      email: String,
      phone: String,
      residentialAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
      }
    },
    passportInfo: {
      passportNumber: String,
      issueDate: Date,
      expiryDate: Date
    },
    documents: {
      passport: {
        fileUrl: String,
        verified: Boolean
      },
      photo: {
        fileUrl: String,
        verified: Boolean,
        takenWithApp: Boolean
      }
    },
    backgroundCheck: {
      hasCriminalRecord: Boolean,
      hasVisaRejections: Boolean,
      details: String
    },
    dataConsent: {
      type: Boolean,
      required: true,
      timestamp: Date
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewing', 'approved', 'rejected'],
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
- ReinoUnidoVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - uploadDocuments
  - processPayment
  - takePhoto

#### Routes
- POST /api/visa/reino-unido
- PUT /api/visa/reino-unido/:id
- GET /api/visa/reino-unido/:id
- POST /api/visa/reino-unido/:id/submit
- POST /api/visa/reino-unido/:id/documents
- POST /api/visa/reino-unido/:id/photo
- POST /api/visa/reino-unido/:id/payment

### Frontend Changes
#### Components
- ReinoUnidoVisaForm
  - PersonalInfoStep
  - PassportInfoStep
  - PhotoCaptureStep
  - DocumentUploadStep
  - BackgroundCheckStep
  - DataConsentStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- PhotoCapture
- DocumentUploader
- PaymentProcessor
- ApplicationReview

#### Services
- reinoUnidoVisaService:
  - Form state management
  - Photo capture handling
  - Document upload handling
  - Payment processing
  - Application submission
  - Progress tracking

### Dependencies
- Authentication System ✅ (#1)
- User Profile Management ✅ (#2)
- Document Upload System (#10)
- Payment System (#13)

### Required Documents
1. Passport scan
2. Passport-size photo (upload or app capture)
3. Additional supporting documents if required based on background check responses
