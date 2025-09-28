# India Visa Form

## Requirements
### User Story
"As a user, I want to apply for an India tourist visa through a simple and guided form process"

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
- India Application Model:  ```javascript
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
    employmentInfo: {
      occupation: String,
      companyName: String,
      employerAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
      },
      employerPhone: String
    },
    passportInfo: {
      passportNumber: String,
      issueDate: Date,
      expiryDate: Date
    },
    travelInfo: {
      entryAirport: String,
      plannedArrivalDate: Date,
      accommodation: {
        type: String, // hotel/private
        name: String,
        address: String,
        phone: String
      }
    },
    references: {
      india: {
        name: String,
        address: String,
        phone: String
      },
      spain: {
        name: String,
        relationship: String,
        phone: String
      }
    },
    documents: {
      passport: {
        fileUrl: String,
        verified: Boolean
      },
      photo: {
        fileUrl: String,
        verified: Boolean
      }
    },
    termsAccepted: {
      type: Boolean,
      required: true
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
- IndiaVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - uploadDocuments
  - processPayment

#### Routes
- POST /api/visa/india
- PUT /api/visa/india/:id
- GET /api/visa/india/:id
- POST /api/visa/india/:id/submit
- POST /api/visa/india/:id/documents
- POST /api/visa/india/:id/payment

### Frontend Changes
#### Components
- IndiaVisaForm
  - PersonalInfoStep
  - EmploymentInfoStep
  - PassportInfoStep
  - TravelInfoStep
  - ReferencesStep
  - DocumentUploadStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- DocumentUploader
- PaymentProcessor
- ApplicationReview

#### Services
- indiaVisaService:
  - Form state management
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
2. Passport-size photo
3. Additional supporting documents as required
