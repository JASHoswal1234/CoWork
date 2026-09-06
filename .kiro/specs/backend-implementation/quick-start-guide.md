# Quick Start Guide: Backend Implementation

## 🎯 Recommended Approach

### Option A: Full-Stack (Recommended for Production)
**Timeline:** 4-6 months | **Team:** 4-6 developers
- Complete backend with database
- Real authentication and payments
- Mobile apps
- ML features
- **Best for:** Actual product launch

### Option B: Backend MVP (Recommended to Start)
**Timeline:** 4-6 weeks | **Team:** 2-3 developers  
- Basic backend API
- Simple database
- Working authentication
- Mock payments
- **Best for:** Testing with real users, fundraising demo

### Option C: Hybrid (Quick Win)
**Timeline:** 2-3 weeks | **Team:** 1-2 developers
- Keep frontend as-is
- Add Firebase/Supabase backend
- Basic auth and database
- **Best for:** Hackathon evolution, quick validation

---

## 🚀 I Recommend: Option B (Backend MVP)

### Week 1-2: Foundation
```
Day 1-3: Backend Setup
├── Set up NestJS project
├── Configure PostgreSQL database
├── Design database schema
├── Set up environment variables
└── Create base API structure

Day 4-7: Authentication
├── Implement JWT authentication
├── Phone OTP verification (Twilio/SNS)
├── User registration (Customer/Worker)
├── Role-based access control
└── Connect frontend to auth API

Day 8-14: Core Features
├── Worker CRUD operations
├── Service catalog management
├── Job creation and listing
├── Basic job matching algorithm
└── Job status updates
```

### Week 3-4: Essential Features
```
Day 15-21: Job Management
├── Worker job acceptance
├── Job status tracking
├── Customer-worker assignment
├── Basic file upload (S3/Cloudinary)
└── Notifications (email/SMS)

Day 22-28: Polish & Deploy
├── API testing
├── Error handling
├── Deploy to cloud (AWS/Railway/Render)
├── Connect frontend to all endpoints
└── Basic admin operations
```

### Week 5-6: Enhancement
```
Day 29-35: Payments & Reviews
├── Payment gateway integration (Razorpay)
├── Payment flow (customer → cooperative → worker)
├── Rating and review system
└── Financial tracking

Day 36-42: Real-time Features
├── WebSocket setup for live updates
├── Job tracking improvements
├── Push notifications (Firebase)
└── Testing and bug fixes
```

---

## 💻 Tech Stack (MVP)

### Backend
```
- NestJS (TypeScript Node.js framework)
- PostgreSQL (Database)
- Prisma ORM (Database access)
- Redis (Caching, sessions)
- JWT (Authentication)
```

### Services
```
- Twilio (SMS OTP)
- SendGrid (Email)
- Cloudinary (File upload)
- Razorpay (Payments)
- Firebase (Push notifications)
```

### Deployment
```
- Railway.app (Backend hosting) - FREE tier available
- Vercel (Frontend) - Already optimized
- Supabase (Database alternative) - FREE tier
```

---

## 📁 New Project Structure

```
sahakar-services/
├── frontend/                    # Your current React app
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                     # New NestJS backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # User management
│   │   ├── workers/            # Worker profiles
│   │   ├── jobs/               # Job management
│   │   ├── services/           # Service catalog
│   │   ├── payments/           # Payment processing
│   │   ├── dispatch/           # Worker matching logic
│   │   ├── notifications/      # SMS, email, push
│   │   └── common/             # Shared utilities
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── test/
│   └── package.json
│
├── mobile/                      # Future: React Native app
│   └── (to be created)
│
└── docs/
    ├── api-spec.md
    └── database-design.md
```

---

## 🗄️ Database Schema (Core Tables)

```sql
-- Users (base for all roles)
users
├── id (UUID)
├── phone
├── email
├── password_hash
├── role (ENUM: customer, worker, admin)
├── verified
└── created_at

-- Workers
workers
├── id (UUID)
├── user_id (FK → users)
├── name
├── photo_url
├── location (GEOGRAPHY POINT)  -- PostGIS
├── service_radius (INTEGER)
├── available (BOOLEAN)
├── rating (DECIMAL)
├── total_ratings
├── completed_jobs
└── verification_status

-- Skills
worker_skills
├── id
├── worker_id (FK)
├── category
├── subcategory
├── verified (BOOLEAN)
├── level (ENUM)
└── verification_date

-- Jobs
jobs
├── id (UUID)
├── customer_id (FK → users)
├── worker_id (FK → workers, nullable)
├── service_category
├── service_subcategory
├── description
├── location (GEOGRAPHY POINT)
├── status (ENUM: pending, matched, accepted, in_progress, completed, cancelled)
├── estimated_price
├── actual_price
├── created_at
├── completed_at
└── rating

-- Payments
payments
├── id
├── job_id (FK)
├── amount
├── cooperative_share
├── worker_earnings
├── status (ENUM: pending, completed, refunded)
├── razorpay_payment_id
└── created_at
```

---

## 🔌 API Endpoints (Essential)

### Authentication
```
POST   /auth/register          # Register user
POST   /auth/login             # Login (phone + password)
POST   /auth/send-otp          # Send OTP
POST   /auth/verify-otp        # Verify OTP
GET    /auth/me                # Get current user
```

### Workers
```
GET    /workers                # List all workers
GET    /workers/:id            # Get worker details
POST   /workers                # Create worker profile
PUT    /workers/:id            # Update worker
PATCH  /workers/:id/toggle     # Toggle availability
```

### Jobs
```
POST   /jobs                   # Create job (customer)
GET    /jobs                   # List jobs (filtered by role)
GET    /jobs/:id               # Get job details
POST   /jobs/:id/match         # Dispatch worker
POST   /jobs/:id/accept        # Worker accepts
POST   /jobs/:id/reject        # Worker rejects
PATCH  /jobs/:id/status        # Update status
POST   /jobs/:id/complete      # Complete job
POST   /jobs/:id/rate          # Rate job
```

### Services
```
GET    /services               # List service categories
GET    /services/:id           # Get service details
```

### Payments
```
POST   /payments/create-order  # Create Razorpay order
POST   /payments/verify        # Verify payment
GET    /payments/:jobId        # Get payment details
```

---

## 🛠️ Development Commands

### Backend Setup
```bash
# Create backend project
cd sahakar-services
npx @nestjs/cli new backend
cd backend

# Install dependencies
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client prisma
npm install twilio @sendgrid/mail
npm install @nestjs/websockets socket.io

# Initialize Prisma
npx prisma init

# Create database
npx prisma migrate dev --name init

# Run development
npm run start:dev
```

### Frontend Updates
```bash
cd frontend

# Install API client
npm install axios
# OR
npm install @tanstack/react-query axios

# Update environment variables
# Add to .env.local:
VITE_API_URL=http://localhost:3001
```

---

## 🔄 Migration Strategy

### Step 1: Replace Mock Data Context
```typescript
// Before (MockDataContext.tsx)
const workers = mockWorkers;

// After (create useAPI hook)
const { data: workers, isLoading } = useQuery({
  queryKey: ['workers'],
  queryFn: () => api.get('/workers').then(res => res.data)
});
```

### Step 2: Replace Dispatch Engine
```typescript
// Before (dispatchEngine.ts)
export function dispatchWorker(request, allWorkers) {
  // Local logic
}

// After
export async function dispatchWorker(request) {
  const response = await api.post('/jobs/match', request);
  return response.data;
}
```

### Step 3: Add Real-time Updates
```typescript
// New: useJobTracking hook
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useJobTracking(jobId) {
  useEffect(() => {
    const socket = io('http://localhost:3001');
    
    socket.emit('track-job', jobId);
    socket.on('job-update', (data) => {
      // Update UI
    });
    
    return () => socket.disconnect();
  }, [jobId]);
}
```

---

## 💰 Cost Estimate (MVP - First 3 Months)

### Development (if outsourced)
- Backend developer: ₹50,000-80,000/month × 2 = ₹1,00,000-1,60,000
- Total: ₹3,00,000-4,80,000 (3 months)

### Services (Monthly)
- Railway.app (Backend): ₹0 (free tier) → ₹1,000/month
- Vercel (Frontend): ₹0 (free tier)
- Supabase (Database): ₹0 (free tier) → ₹2,000/month
- Twilio (SMS): ₹5,000/month (1000 OTPs)
- Cloudinary (Files): ₹0 (free tier)
- Razorpay: 2% per transaction
- **Total: ₹5,000-10,000/month initially**

### Budget-Friendly Alternative
- Use Supabase (free PostgreSQL + auth)
- Deploy on free tiers
- Use test payment gateway
- **Total: ₹5,000/month for SMS only**

---

## ✅ MVP Success Criteria

After 6 weeks, you should have:
- [ ] Users can register with phone OTP
- [ ] Workers can create profiles and toggle availability
- [ ] Customers can create job requests
- [ ] System matches jobs to workers (rule-based)
- [ ] Workers can accept/reject jobs
- [ ] Job status updates work
- [ ] Basic payment flow (test mode)
- [ ] Rating and review system
- [ ] Admin can view all jobs and workers

---

## 🎓 Learning Resources

### Backend Development
- NestJS Docs: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL + PostGIS: https://postgis.net

### Integration Tutorials
- Razorpay Integration: https://razorpay.com/docs
- Twilio SMS: https://www.twilio.com/docs/sms
- Firebase Push Notifications: https://firebase.google.com/docs/cloud-messaging

---

## 📞 Next Steps

1. **Decision:** Choose between Option A, B, or C
2. **If Option B (MVP):** I can help you:
   - Set up the NestJS backend structure
   - Create database schema
   - Build authentication endpoints
   - Connect frontend to backend
   
3. **If Option C (Hybrid):** I can help you:
   - Set up Supabase project
   - Create database tables
   - Add authentication to frontend
   - Replace mock data with real data

**What would you like to start with?**
