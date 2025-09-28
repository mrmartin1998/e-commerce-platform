# Costa Rica Visa Form

## Requirements
### User Story
"As a user, I want to apply for a Costa Rica tourist visa through a simple and guided form process"

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
- Costa Rica Application Model:  ```javascript
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personalInfo: {
      fullName: String,
      dateOfBirth: Date,
      nationality: String,
      passportNumber: String,
      passportExpiry: Date,
      birthPlace: String,
      gender: String
    },
    travelInfo: {
      purposeOfTravel: String,
      intendedArrivalDate: Date,
      lengthOfStay: Number,
      accommodationAddress: String,
      returnTicketInfo: String
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
      bankStatement: {
        fileUrl: String,
        verified: Boolean
      },
      travelItinerary: {
        fileUrl: String,
        verified: Boolean
      }
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
- CostaRicaVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - uploadDocuments
  - processPayment

#### Routes
- POST /api/visa/costa-rica
- PUT /api/visa/costa-rica/:id
- GET /api/visa/costa-rica/:id
- POST /api/visa/costa-rica/:id/submit
- POST /api/visa/costa-rica/:id/documents
- POST /api/visa/costa-rica/:id/payment

### Frontend Changes
#### Components
- CostaRicaVisaForm
  - PersonalInfoStep
  - TravelInfoStep
  - DocumentUploadStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- DocumentUploader
- PaymentProcessor
- ApplicationReview

#### Services
- costaRicaVisaService:
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
3. Bank Statements
4. Travel Itinerary
5. Hotel Reservations (if applicable)
6. Return Ticket Information
