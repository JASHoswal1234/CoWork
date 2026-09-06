# Implementation Plan: Backend for SAHAKAR // SERVICES

## Overview

This implementation plan breaks down the backend development into discrete, incremental tasks following the hackathon timeline strategy. Each task builds upon previous work to ensure a continuously working demo at every stage.

**Total Timeline**: 30-35 hours
**Approach**: Agile incremental development with working features at each phase
**Success Criteria**: Complete end-to-end user journey working for hackathon demo

---

## Tasks

### Phase 1: Core Infrastructure and Auth (Hours 0-8)

- [ ] 1. Initialize project and setup development environment
  - Create Node.js + Express + TypeScript project structure
  - Install core dependencies: express, @supabase/supabase-js, dotenv, cors
  - Setup TypeScript configuration (tsconfig.json)
  - Create environment variables template (.env.example)
  - Initialize Supabase project (free tier) and get connection details
  - Setup basic server.ts with Express app and health check endpoint
  - _Requirements: 15.1, 15.2, 15.9_

- [ ] 2. Setup database schema in Supabase
  - [ ] 2.1 Enable PostGIS extension in Supabase SQL editor
    - Run: CREATE EXTENSION IF NOT EXISTS postgis;
    - _Requirements: 3.1, 14.2_
  
  - [ ] 2.2 Create profiles table extending auth.users
    - Columns: id (FK to auth.users), role, name, phone, email, avatar_url, fcm_token, timestamps
    - Add CHECK constraint for role enum (customer, worker, admin)
    - _Requirements: 1.4, 14.1_
  
  - [ ] 2.3 Create workers table with PostGIS location column
    - Columns: id, user_id (FK), skills (text[]), status, is_available, current_location (GEOMETRY), service_radius_km, average_rating, total_reviews, wallet_balance, timestamps
    - Create GIST spatial index on current_location: CREATE INDEX idx_workers_location ON workers USING GIST(current_location);
    - Create index on availability: CREATE INDEX idx_workers_available ON workers(is_available) WHERE status = 'active';
    - _Requirements: 2.1, 3.1, 14.5, 14.6_
  
  - [ ] 2.4 Create jobs table with location and status tracking
    - Columns: id, customer_id (FK), worker_id (FK), service_type, status (enum), location (GEOMETRY), address, description, photos (text[]), scheduled_time, price_estimate, final_price, payment_status, timestamps (created_at, assigned_at, accepted_at, started_at, completed_at, verified_at)
    - Create indexes on customer_id, worker_id, status, and location (GIST)
    - _Requirements: 4.1, 14.1, 14.6_
  
  - [ ] 2.5 Create supporting tables (reviews, transactions, payouts, notifications, worker_documents)
    - Reviews: id, job_id (FK, UNIQUE), customer_id (FK), worker_id (FK), rating, comment, worker_response, timestamps
    - Transactions: id, job_id (FK), razorpay_order_id, razorpay_payment_id, amount, worker_amount, cooperative_amount, status, refund_id, timestamps
    - Payouts: id, worker_id (FK), amount, razorpay_payout_id, status, bank_account_last4, timestamps
    - Notifications: id, user_id (FK), type, title, body, data (JSONB), is_read, created_at
    - Worker_documents: id, worker_id (FK), document_type, file_url, status, reviewed_by (FK), reviewed_at, rejection_reason, uploaded_at
    - Create appropriate indexes on each table
    - _Requirements: 5.3, 6.1, 8.1, 12.3, 14.1_
  
  - [ ] 2.6 Create PostgreSQL helper functions
    - add_to_wallet(worker_id UUID, amount DECIMAL)
    - deduct_from_wallet(worker_id UUID, amount DECIMAL)
    - append_job_photo(job_id UUID, photo_url TEXT)
    - find_nearby_workers(lat FLOAT, lng FLOAT, service_type TEXT, radius_meters INT) - returns worker matches with distance
    - _Requirements: 3.1, 5.3, 14.8_
  
  - [ ] 2.7 Create triggers for updated_at timestamps
    - Create update_updated_at() function
    - Apply triggers to profiles and workers tables
    - _Requirements: 14.1, 14.7_

- [ ] 3. Implement authentication service using Supabase Auth
  - [ ] 3.1 Create auth middleware for JWT validation
    - Extract token from Authorization header
    - Validate token using supabase.auth.getUser()
    - Attach user object to req.user
    - Handle expired tokens with 401 response
    - _Requirements: 1.2, 1.3, 16.1_
  
  - [ ] 3.2 Create role-based authorization middleware
    - requireRole(allowedRoles: UserRole[]) middleware
    - Check user role from profiles table
    - Return 403 Forbidden if role not allowed
    - _Requirements: 1.5, 1.6, 1.7_
  
  - [ ] 3.3 Implement registration endpoints
    - POST /api/auth/register - Email/password registration with Supabase Auth
    - Create profile record with selected role
    - Return user object and JWT token
    - _Requirements: 1.1, 1.4_
  
  - [ ] 3.4 Implement login and token management endpoints
    - POST /api/auth/login - Login with email/password
    - POST /api/auth/refresh - Refresh JWT token
    - POST /api/auth/password/reset - Request password reset
    - POST /api/auth/password/update - Update password with reset token
    - GET /api/auth/me - Get current user profile
    - _Requirements: 1.2, 1.8, 1.9_

- [ ]* 3.5 Write property test for authentication
  - **Property 1: Authentication Token Generation and Validation**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ]* 3.6 Write property test for role-based access control
  - **Property 2: Role-Based Access Control Enforcement**
  - **Validates: Requirements 1.5, 1.6, 1.7**

- [ ] 4. Checkpoint - Test auth flow end-to-end
  - Verify user can register, login, and access protected routes
  - Verify role-based restrictions work correctly
  - Test token expiration handling
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Core Job Flow and Geospatial Matching (Hours 8-20)

- [ ] 5. Implement worker profile management
  - [ ] 5.1 Create worker registration and profile endpoints
    - POST /api/workers - Create worker profile after user registration (role=worker)
    - Include skills (array), bio, location (lat/lng), service_radius_km, hourly_rate
    - Store location as PostGIS POINT(lng lat)
    - Set initial status='pending' for admin approval
    - _Requirements: 2.1, 2.4, 2.9_
  
  - [ ] 5.2 Implement worker profile CRUD
    - GET /api/workers/:id - Get worker profile with average rating and reviews count
    - PATCH /api/workers/:id - Update worker profile (protected: own profile or admin)
    - PATCH /api/workers/:id/location - Update current location
    - PATCH /api/workers/:id/availability - Toggle is_available status
    - _Requirements: 2.1, 2.9, 3.4_
  
  - [ ] 5.3 Implement admin worker verification endpoints
    - GET /api/admin/workers/pending - List workers with status='pending'
    - PATCH /api/admin/workers/:id/approve - Set status='active'
    - PATCH /api/admin/workers/:id/reject - Set status='rejected' with reason
    - Require role='admin' using authorization middleware
    - _Requirements: 2.6, 2.7, 2.8_

- [ ]* 5.4 Write property test for worker profile management
  - **Property 3: Worker Profile State Transitions**
  - **Validates: Requirements 2.6, 2.7, 2.8, 2.9**

- [ ] 6. Implement geospatial worker matching service
  - [ ] 6.1 Create geospatial calculation utilities
    - calculateDistance(lat1, lng1, lat2, lng2) using haversine formula
    - estimateETA(distanceKm) - simple time estimate (distance / avg_speed)
    - _Requirements: 3.5, 3.8_
  
  - [ ] 6.2 Implement worker search with PostGIS
    - POST /api/geospatial/workers/search - Find nearby workers
    - Call find_nearby_workers PostgreSQL function with 10km radius
    - If no results, retry with 25km radius
    - Filter by skills matching service_type
    - Rank results by distance (ASC), rating (DESC)
    - Return worker details with distance_meters and eta_minutes
    - _Requirements: 3.1, 3.2, 3.3, 3.7_
  
  - [ ] 6.3 Implement location update endpoint
    - POST /api/geospatial/workers/location - Update worker current_location
    - Validate worker_id matches authenticated user
    - Update location and location_updated_at timestamp
    - _Requirements: 3.4_

- [ ]* 6.4 Write property test for distance calculations
  - **Property 4: Geospatial Distance Calculation Correctness**
  - **Validates: Requirements 3.4, 3.5**

- [ ]* 6.5 Write property test for radius expansion
  - **Property 5: Worker Matching Radius Expansion**
  - **Validates: Requirements 3.1, 3.3**

- [ ]* 6.6 Write property test for worker ranking
  - **Property 6: Worker Ranking Consistency**
  - **Validates: Requirements 3.2, 3.7, 3.8**

- [ ] 7. Implement job lifecycle management
  - [ ] 7.1 Create job creation endpoint with validation
    - POST /api/jobs - Create new job
    - Validate required fields: service_type, location {lat, lng}, address, description
    - Set status='created', payment_status='pending'
    - Store location as PostGIS POINT
    - If photos provided, store in job.photos array (URLs from file upload)
    - _Requirements: 4.1, 4.10_
  
  - [ ] 7.2 Implement job matching algorithm
    - After job creation, call geospatial search to find top 3 workers
    - If workers found, select closest worker and assign
    - Update job: worker_id, status='assigned', assigned_at
    - Update worker: is_available=false
    - Create notification for worker
    - _Requirements: 4.2, 4.3_
  
  - [ ] 7.3 Implement job acceptance endpoints
    - POST /api/jobs/:id/accept - Worker accepts job
    - Validate job.worker_id matches authenticated worker
    - Validate current status='assigned'
    - Update status='accepted', accepted_at timestamp
    - Create notification for customer
    - _Requirements: 4.4, 4.5_
  
  - [ ] 7.4 Implement job status transition endpoints
    - PATCH /api/jobs/:id/status - Update job status
    - Validate state transitions using isValidTransition() function
    - Allowed transitions: created→assigned→accepted→in_progress→completed→verified
    - Update relevant timestamps (started_at, completed_at, verified_at)
    - Broadcast status update via Supabase Realtime
    - _Requirements: 4.6, 4.7, 4.8, 4.9_
  
  - [ ] 7.5 Implement job retrieval endpoints
    - GET /api/jobs/:id - Get job details with embedded worker/customer info
    - GET /api/jobs - List jobs with filters (status, customer_id, worker_id)
    - Support pagination: ?page=1&limit=20
    - Support sorting: ?sort_by=created_at&order=desc
    - _Requirements: 4.11, 15.5, 15.7_
  
  - [ ] 7.6 Implement dispute handling
    - POST /api/jobs/:id/dispute - Customer disputes completion
    - Update status='disputed'
    - Create notification for admin
    - _Requirements: 4.9_

- [ ]* 7.7 Write property test for job state machine
  - **Property 7: Job State Machine Validity**
  - **Validates: Requirements 4.2, 4.5, 4.6, 4.7, 4.8, 4.9**

- [ ]* 7.8 Write property test for job creation and matching
  - **Property 8: Job Creation and Matching**
  - **Validates: Requirements 4.1, 4.10, 4.11**

- [ ] 8. Checkpoint - Test complete job flow
  - Create job → Worker matched and assigned → Worker accepts → Status updates work
  - Verify geospatial matching finds correct workers
  - Verify state transitions enforce valid paths
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Payments, Reviews, and File Upload (Hours 20-28)

- [ ] 9. Implement payment simulation service
  - [ ] 9.1 Create payment calculation utilities
    - calculateJobPrice(hourlyRate, durationHours) - estimate price
    - splitPayment(amount) - return {workerAmount: 85%, cooperativeAmount: 15%}
    - _Requirements: 5.1, 5.3_
  
  - [ ] 9.2 Implement payment initiation (simulation mode for demo)
    - POST /api/payments/create-order - Create payment record
    - Store job_id, amount, status='pending'
    - For hackathon: Return mock order data {orderId, amount}
    - For production integration: Create Razorpay order
    - _Requirements: 5.2_
  
  - [ ] 9.3 Implement payment completion and wallet crediting
    - POST /api/payments/verify - Mark payment as completed
    - For hackathon: Accept {orderId, status: 'success'|'failed'}
    - For production: Verify Razorpay signature
    - On success: Call add_to_wallet() for worker (85%)
    - On success: Create cooperative_earnings record (15%)
    - Update transaction status='completed', payment timestamps
    - Update job.payment_status='paid'
    - Use database transaction for atomicity
    - _Requirements: 5.2, 5.3, 5.6_
  
  - [ ] 9.4 Implement wallet and payout endpoints
    - GET /api/workers/:id/wallet - Get wallet balance
    - GET /api/workers/:id/transactions - Get transaction history
    - POST /api/workers/:id/payout - Request payout (status='pending' for admin approval)
    - PATCH /api/admin/payouts/:id/approve - Admin approves payout, call deduct_from_wallet()
    - _Requirements: 5.5, 5.6_
  
  - [ ] 9.5 Implement refund handling for disputes
    - POST /api/payments/refund - Process refund for disputed job
    - Reverse wallet transaction: call deduct_from_wallet() for worker
    - Update transaction status='refunded', job.payment_status='refunded'
    - _Requirements: 5.7_

- [ ]* 9.6 Write property test for payment split
  - **Property 9: Payment Split Correctness**
  - **Validates: Requirements 5.1, 5.3**

- [ ]* 9.7 Write property test for payment atomicity
  - **Property 10: Payment Processing Atomicity**
  - **Validates: Requirements 5.2, 5.3, 5.6**

- [ ]* 9.8 Write property test for payout validation
  - **Property 11: Worker Payout Validation**
  - **Validates: Requirements 5.6**

- [ ] 10. Implement review and rating system
  - [ ] 10.1 Create review submission endpoint
    - POST /api/reviews - Submit review after job completion
    - Validate: rating 1-5, job_id references completed job, customer is job creator
    - Create review record with job_id, customer_id, worker_id, rating, comment
    - UNIQUE constraint on job_id ensures one review per job
    - _Requirements: 6.1, 6.2_
  
  - [ ] 10.2 Implement rating recalculation
    - After review creation, recalculate worker average rating
    - Query all reviews for worker, calculate mean rating
    - Update workers.average_rating and workers.total_reviews
    - If rating < 3, flag worker for admin review (create notification)
    - _Requirements: 6.3, 6.4_
  
  - [ ] 10.3 Implement review retrieval endpoints
    - GET /api/reviews/worker/:id - Get reviews for worker (paginated)
    - Anonymize customer names: "Customer A", "Customer B"
    - Return average_rating and total_reviews in response
    - _Requirements: 6.5, 6.6_
  
  - [ ] 10.4 Implement worker response to reviews
    - POST /api/reviews/:id/respond - Worker adds response to review
    - Update review.worker_response and review.responded_at
    - _Requirements: 6.7_

- [ ]* 10.5 Write property test for review validation
  - **Property 12: Review Rating Validation**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 10.6 Write property test for rating calculation
  - **Property 13: Worker Average Rating Calculation**
  - **Validates: Requirements 6.3, 6.5**

- [ ] 11. Implement file upload service using Supabase Storage
  - [ ] 11.1 Setup Supabase Storage buckets
    - Create buckets via Supabase dashboard: 'profile-photos', 'job-images', 'documents'
    - Configure 'documents' bucket as private (admin-only access)
    - Configure other buckets as public
    - _Requirements: 12.6, 12.9_
  
  - [ ] 11.2 Create file upload validation middleware
    - Validate file type in [jpg, png, jpeg, pdf, webp]
    - Validate file size ≤ 5MB
    - Return 400 Bad Request with specific error if validation fails
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ] 11.3 Implement file upload endpoints
    - POST /api/files/upload/profile-photo - Upload profile photo
    - POST /api/files/upload/job-photo - Upload job photo
    - POST /api/files/upload/worker-document - Upload KYC/certificate (worker only)
    - Use multer or express-fileupload for multipart/form-data
    - Upload to appropriate Supabase Storage bucket
    - Return public URL in response
    - _Requirements: 12.3, 12.5, 12.6, 12.7_
  
  - [ ] 11.4 Integrate file uploads with existing endpoints
    - Update workers table: profile_image_url column
    - Update jobs: append photo URLs to photos array using append_job_photo()
    - Create worker_documents records on document upload
    - _Requirements: 12.5, 12.6, 12.7_

- [ ]* 11.5 Write property test for file upload validation
  - **Property 19: File Upload Validation**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [ ] 12. Checkpoint - Test payments, reviews, and uploads
  - Complete job → Initiate payment → Verify payment → Check wallet credited
  - Submit review → Verify rating recalculated
  - Upload profile photo → Upload job photo → Verify URLs returned
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Real-Time, Notifications, ML, and Admin (Hours 28-35)

- [ ] 13. Implement real-time updates using Supabase Realtime
  - [ ] 13.1 Setup Supabase Realtime subscriptions (client-side code example)
    - Document how to subscribe to job updates: supabase.channel(`job:${jobId}`).on('postgres_changes', {...})
    - Document how to subscribe to worker location updates
    - _Requirements: 7.1, 7.2_
  
  - [ ] 13.2 Implement server-side real-time broadcasting
    - When job status updates, trigger Supabase Realtime broadcast
    - Use Supabase's built-in postgres_changes feature
    - Alternatively, use Socket.io for custom events
    - Broadcast job status changes, worker location updates
    - _Requirements: 7.1, 7.3, 7.4_
  
  - [ ] 13.3 Implement fallback polling mechanism
    - GET /api/jobs/:id/status - Lightweight endpoint for polling
    - Return current status and last_updated timestamp
    - _Requirements: 7.8_

- [ ]* 13.4 Write property test for real-time broadcasting
  - **Property 14: Real-Time Job Status Broadcasting**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [ ] 14. Implement basic notification system
  - [ ] 14.1 Create notification helper functions
    - createNotification(userId, type, title, body, data) - Insert notification record
    - Call after key events: job accepted, job completed, payment received, etc.
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 14.2 Implement notification endpoints
    - GET /api/notifications - Get user's notifications (unread first)
    - PATCH /api/notifications/:id/read - Mark notification as read
    - Include deep link data in notification.data for frontend navigation
    - _Requirements: 8.4, 8.5, 8.9_
  
  - [ ] 14.3 Integrate notification creation into job flow
    - On job assignment: notify worker
    - On job acceptance: notify customer
    - On job completion: notify customer
    - On payment: notify both customer and worker
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

- [ ]* 14.4 Write property test for notification creation
  - **Property 15: Notification Creation for Job Events**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.6**

- [ ] 15. Implement ML forecasting and analytics with synthetic data
  - [ ] 15.1 Create synthetic demand forecast generator
    - GET /api/ml/forecast/demand - Generate forecast for next 7 days
    - Use historical job data to calculate baseline
    - Apply patterns: weekend boost (+40%), seasonal trends, random variation
    - Return: [{date, predicted_demand, confidence_score}]
    - _Requirements: 9.1, 9.2, 9.8_
  
  - [ ] 15.2 Implement skill gap analysis
    - GET /api/ml/analysis/skill-gaps - Analyze supply vs demand by skill
    - Query unfilled jobs (status='created') by service_type
    - Count available workers per skill
    - Calculate unfilled_rate = unfilled / (unfilled + filled)
    - Assign severity: critical (>50%), high (30-50%), medium (15-30%), low (<15%)
    - Return results ranked by severity with recommended actions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 15.3 Create admin analytics endpoints (optional if time permits)
    - GET /api/ml/pricing/surge - Return surge multiplier based on current demand
    - Simple rule: if pending jobs > active workers * 2, apply 1.5x surge
    - _Requirements: 5.9_

- [ ]* 15.4 Write property test for forecast data format
  - **Property 16: Demand Forecast Data Format**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.8**

- [ ]* 15.5 Write property test for skill gap calculation
  - **Property 17: Skill Gap Analysis Calculation**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.8**

- [ ] 16. Implement admin dashboard backend APIs
  - [ ] 16.1 Create admin dashboard summary endpoint
    - GET /api/admin/dashboard - Return summary metrics
    - total_jobs (COUNT from jobs), active_workers (COUNT WHERE status='active')
    - pending_verifications (COUNT workers WHERE status='pending')
    - total_revenue (SUM transactions.amount WHERE status='completed')
    - _Requirements: 11.1_
  
  - [ ] 16.2 Implement worker management endpoints
    - GET /api/admin/workers - List all workers with filters (status, skills, rating)
    - Support search: ?search=name (SQL LIKE query)
    - Support pagination and sorting
    - _Requirements: 11.2, 11.3_
  
  - [ ] 16.3 Implement job monitoring endpoints
    - GET /api/admin/jobs - List all jobs with status breakdown
    - Support filters: ?status=disputed
    - Include job details, customer info, worker info
    - _Requirements: 11.4_
  
  - [ ] 16.4 Implement financial overview endpoints
    - GET /api/admin/financials - Aggregate financial data
    - total_revenue, cooperative_earnings (15% of revenue), pending_payouts
    - _Requirements: 11.5_
  
  - [ ] 16.5 Implement dispute resolution endpoints
    - GET /api/admin/disputes - List jobs with status='disputed'
    - PATCH /api/admin/disputes/:id/resolve - Resolve dispute
    - If customer_favor: refund payment, update job status='refunded'
    - If worker_favor: update job status='completed', maintain payment
    - _Requirements: 11.6, 11.7, 11.8_
  
  - [ ] 16.6 Implement data export endpoint (optional if time permits)
    - GET /api/admin/export - Export data as CSV
    - Support filters: ?entity=jobs&from=2024-01-01&to=2024-01-31
    - Return CSV file download
    - _Requirements: 11.10_

- [ ]* 16.7 Write property test for dashboard metrics
  - **Property 18: Admin Dashboard Metrics Accuracy**
  - **Validates: Requirements 11.1, 11.5**

- [ ] 17. Add API consistency and error handling
  - [ ] 17.1 Create global error handler middleware
    - Catch all errors and format consistently: {success: false, error: {code, message, details}, timestamp}
    - Map error types to HTTP status codes
    - Hide stack traces in production
    - _Requirements: 15.4, 16.2_
  
  - [ ] 17.2 Create success response wrapper
    - Standardize success responses: {success: true, data: {...}}
    - Apply to all API endpoints
    - _Requirements: 15.3_
  
  - [ ] 17.3 Implement input validation middleware
    - Use express-validator or Joi for request validation
    - Validate required fields, data types, ranges
    - Return 400 Bad Request with field-specific errors
    - _Requirements: 16.2_
  
  - [ ] 17.4 Add rate limiting middleware
    - Use express-rate-limit
    - Limit: 100 requests per minute per IP
    - Apply to all routes
    - _Requirements: 16.5_

- [ ]* 17.5 Write property test for API response format
  - **Property 21: API Response Format Consistency**
  - **Validates: Requirements 15.3, 15.4, 15.5**

- [ ]* 17.6 Write property test for API conventions
  - **Property 22: API REST Conventions**
  - **Validates: Requirements 15.1, 15.2**

- [ ]* 17.7 Write property test for JWT security
  - **Property 23: JWT Token Security**
  - **Validates: Requirements 16.1, 16.2**

- [ ]* 17.8 Write property test for input validation
  - **Property 24: Input Validation and Sanitization**
  - **Validates: Requirements 16.2, 16.3, 16.9**

- [ ] 18. Implement PWA support (optional if time permits)
  - [ ] 18.1 Serve manifest.json
    - GET /manifest.json - Serve PWA manifest with app name, icons, theme colors
    - _Requirements: 13.1_
  
  - [ ] 18.2 Serve service worker file
    - GET /service-worker.js - Serve service worker with caching strategies
    - Cache static assets and API responses
    - _Requirements: 13.2, 13.3_
  
  - [ ] 18.3 Configure cache headers for PWA assets
    - Set appropriate cache-control headers
    - Enable CORS for cross-origin requests
    - _Requirements: 13.5, 13.7_

- [ ] 19. Final checkpoint and documentation
  - [ ] 19.1 Create API documentation
    - Document all endpoints with request/response examples
    - Use Swagger/OpenAPI or Postman collection
    - _Requirements: 15.8_
  
  - [ ] 19.2 Write README.md with setup instructions
    - Prerequisites: Node.js, Supabase account
    - Environment variables needed
    - Database setup steps
    - Running the server: npm run dev
    - Running tests: npm test
  
  - [ ] 19.3 Test complete end-to-end user journeys
    - Customer journey: Register → Create job → Pay → Review worker
    - Worker journey: Register → Get verified → Accept job → Complete → Receive payment
    - Admin journey: Approve workers → Resolve disputes → View analytics
  
  - [ ] 19.4 Prepare demo data and scripts (optional)
    - Seed script to populate sample workers, jobs, reviews
    - Makes demo more impressive with realistic data
  
  - [ ] 19.5 Final testing and bug fixes
    - Run all tests (unit + property + integration)
    - Fix any failing tests
    - Test API endpoints manually with Postman/Insomnia
    - Ensure all critical flows work end-to-end
    - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property-based tests. These can be skipped for faster MVP but are valuable for comprehensive correctness validation.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation and provide natural break points for user review.
- Property tests should run minimum 100 iterations each and tag with design document property number.
- Focus on completing Phases 1-3 (hours 0-28) for core demo. Phase 4 adds impressive features if time permits.
- Use Supabase dashboard for quick database debugging and query testing.
- Keep commit messages clear and reference task numbers for easy tracking.

## Testing Notes

- Unit tests: Focus on business logic (calculations, validations, state machines)
- Property tests: Verify universal properties across all valid inputs
- Integration tests: Test API endpoints end-to-end with actual database
- All tests should be runnable with: `npm test`
- Property tests should use fast-check library with 100+ iterations
- Each property test must reference its design document property number in comments
