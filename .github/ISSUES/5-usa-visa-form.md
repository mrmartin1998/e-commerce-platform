# USA Visa Form

## Requirements
### User Story
"As a user, I want to apply for a USA tourist visa through a simple and guided form process"

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
- USA Application Model:  ```javascript
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personalInfo: {
      fullName: String,
      dateOfBirth: Date,
      birthPlace: {
        city: String,
        country: String
      },
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
    familyInfo: {
      fatherName: String,
      motherName: String
    },
    passportInfo: {
      passportNumber: String,
      issueDate: Date,
      expiryDate: Date,
      issuingCountry: String
    },
    travelInfo: {
      previousUSTravel: Boolean,
      usAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
      }
    },
    employmentInfo: {
      companyName: String,
      position: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
      }
    },
    additionalInfo: {
      hasCriminalRecord: Boolean,
      hasImmigrationViolations: Boolean
    },
    documents: {
      passport: {
        fileUrl: String,
        verified: Boolean
      },
      photo: {
        fileUrl: String,
        verified: Boolean
      },
      employmentProof: {
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
- USAVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - uploadDocuments
  - processPayment

#### Routes
- POST /api/visa/usa
- PUT /api/visa/usa/:id
- GET /api/visa/usa/:id
- POST /api/visa/usa/:id/submit
- POST /api/visa/usa/:id/documents
- POST /api/visa/usa/:id/payment

### Frontend Changes
#### Components
- USAVisaForm
  - PersonalInfoStep
  - FamilyInfoStep
  - PassportInfoStep
  - TravelInfoStep
  - EmploymentInfoStep
  - AdditionalInfoStep
  - DocumentUploadStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- DocumentUploader
- PaymentProcessor
- ApplicationReview

#### Services
- usaVisaService:
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
1. Valid Passport
2. Passport-size Photo
3. Employment Verification
4. Additional supporting documents as required
