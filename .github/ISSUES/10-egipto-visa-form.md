# Egipto Visa Form

## Requirements
### User Story
"As a user, I want to apply for a tourist visa to Egypt through a simple and guided form process"

### Acceptance Criteria
- [ ] User can complete visa application form with all required fields
- [ ] User can save progress and return later
- [ ] User can upload required documents (passport photo, passport scan)
- [ ] User can input travel itinerary and accommodation details
- [ ] User can review application before submission
- [ ] User can make payment for visa application
- [ ] User receives confirmation email after submission
- [ ] User can track application status

## Technical Design

### Backend Changes
#### Models
- Egypt Application Model:  ```javascript
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
    passportDetails: {
      passportNumber: String,
      issueDate: Date,
      expiryDate: Date
    },
    travelInfo: {
      estimatedArrivalDate: Date,
      estimatedDepartureDate: Date,
      accommodation: {
        name: String,
        address: String,
        city: String,
        bookingReference: String
      }
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
- EgyptVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - processPayment
  - updateStatus

#### Routes
- POST /api/visa/egypt
- PUT /api/visa/egypt/:id
- GET /api/visa/egypt/:id
- POST /api/visa/egypt/:id/submit
- POST /api/visa/egypt/:id/payment

### Frontend Changes
#### Components
- EgyptVisaForm
  - PersonalInfoStep
  - PassportDetailsStep
  - TravelDetailsStep
  - DocumentUploadStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- DocumentUploader
- PaymentProcessor
- ApplicationReview

#### Services
- egyptVisaService:
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
1. Travel itinerary validation
2. Document size and type validation
3. Multi-step form progress saving
4. Comprehensive document verification system
