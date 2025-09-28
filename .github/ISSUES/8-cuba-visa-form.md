# Cuba Visa Form

## Requirements
### User Story
"As a user, I want to apply for a Cuba tourist visa (tarjeta turística) through a simple and guided form process"

### Acceptance Criteria
- [ ] User can complete visa application form
- [ ] User can save progress and return later
- [ ] User can select delivery method
- [ ] User can review application before submission
- [ ] User can make payment for visa application
- [ ] User receives confirmation email after submission
- [ ] User can track application status

## Technical Design

### Backend Changes
#### Models
- Cuba Application Model:  ```javascript
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
      passportNumber: String,
      email: String,
      phone: String,
      spainAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: 'Spain'
      }
    },
    travelInfo: {
      estimatedEntryDate: Date,
      accommodationAddress: {
        street: String,
        city: String,
        province: String,
        country: 'Cuba'
      },
      flightNumber: String
    },
    deliveryPreference: {
      method: {
        type: String,
        enum: ['mail', 'pickup'],
        required: true
      },
      deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    },
    consentAccepted: {
      type: Boolean,
      required: true,
      timestamp: Date
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'processing', 'ready', 'shipped', 'completed'],
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
- CubaVisaController:
  - createApplication
  - updateApplication
  - submitApplication
  - getApplication
  - saveProgress
  - processPayment
  - updateDeliveryStatus

#### Routes
- POST /api/visa/cuba
- PUT /api/visa/cuba/:id
- GET /api/visa/cuba/:id
- POST /api/visa/cuba/:id/submit
- POST /api/visa/cuba/:id/payment
- PUT /api/visa/cuba/:id/delivery

### Frontend Changes
#### Components
- CubaVisaForm
  - PersonalInfoStep
  - TravelDetailsStep
  - DeliveryPreferenceStep
  - PaymentStep
  - ReviewStep
  - ConfirmationStep
- FormProgressBar
- DeliveryMethodSelector
- PaymentProcessor
- ApplicationReview

#### Services
- cubaVisaService:
  - Form state management
  - Payment processing
  - Application submission
  - Delivery tracking
  - Progress tracking

### Dependencies
- Authentication System ✅ (#1)
- User Profile Management ✅ (#2)
- Payment System (#13)

### Special Features
1. Delivery method selection
2. Flight information (optional)
3. Cuba-specific address format
4. Pickup location details if selected
