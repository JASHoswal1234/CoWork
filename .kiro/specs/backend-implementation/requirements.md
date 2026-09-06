# Requirements Document: Backend Implementation for SAHAKAR // SERVICES

## Introduction

This document specifies the requirements for transforming the SAHAKAR // SERVICES frontend prototype into a fully functional hackathon demo with backend services, database, authentication, real-time features, and ML capabilities. The system enables informal workers (plumbers, electricians, carpenters, etc.) to connect with customers through their local cooperatives, providing fair wages and social security while delivering reliable services.

**HACKATHON CONTEXT:**
- Implementation timeline: 30-35 hours of development time
- Goal: Impress judges with maximum working features, not production-ready code
- Approach: Use smart shortcuts (Supabase, synthetic data, free tiers) with minimal hardcoding
- Current state: Frontend prototype exists with mock data
- Success criteria: "Looks real and works" over "production-grade"

## Glossary

- **System**: The complete SAHAKAR // SERVICES backend application
- **Customer**: End user requesting services
- **Worker**: Service provider (plumber, electrician, carpenter, etc.)
- **Cooperative**: Local organization managing workers
- **Cooperative_Admin**: Administrative user managing cooperative operations
- **Job**: A service request from customer to worker
- **API**: RESTful backend API built with Node.js/Express or NestJS
- **Database**: PostgreSQL database hosted on Supabase (free tier)
- **Auth_Service**: Supabase Auth for email-based authentication
- **Payment_Service**: Simulated payment processing for demo (test mode)
- **Geospatial_Service**: PostGIS extension in Supabase for location-based queries
- **Real_Time_Service**: Supabase Realtime or Socket.io for live updates
- **ML_Service**: API endpoints serving synthetic forecasting data
- **File_Storage**: Supabase Storage for profile pictures and job images
- **PWA**: Progressive Web App with service worker for offline support

---

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user (Customer, Worker, or Cooperative Admin), I want to securely authenticate and access role-appropriate features, so that my account and data are protected.

#### Acceptance Criteria

1. WHEN a user registers with email and password, THE Auth_Service SHALL create a new user account via Supabase Auth
2. WHEN a user logs in with valid credentials, THE Auth_Service SHALL issue a JWT token valid for 7 days
3. WHEN a JWT token is expired, THE System SHALL reject authenticated requests and require re-login
4. WHEN a user selects their role during registration (Customer, Worker, Cooperative_Admin), THE System SHALL store role in user metadata
5. WHERE a user has role Customer, THE API SHALL restrict access to customer-only endpoints using JWT claims
6. WHERE a user has role Worker, THE API SHALL restrict access to worker-only endpoints using JWT claims
7. WHERE a user has role Cooperative_Admin, THE API SHALL grant access to administrative endpoints
8. WHEN a user requests password reset, THE Auth_Service SHALL send reset email via Supabase Auth
9. WHEN a user completes profile setup, THE System SHALL mark profile as complete in database
10. WHEN email verification is sent, THE Auth_Service SHALL use Supabase email templates for consistent branding

### Requirement 2: Worker Profile and Verification (Simplified)

**User Story:** As a Worker, I want to create a profile with my skills and documents, so that I can start accepting jobs quickly.

#### Acceptance Criteria

1. WHEN a worker completes registration, THE System SHALL create worker profile with skills, bio, and location
2. WHEN a worker uploads profile photo, THE System SHALL store it in Supabase Storage and link to profile
3. WHEN a worker uploads KYC document (ID proof), THE System SHALL store it in Supabase Storage with secure access
4. WHEN a worker adds skill tags (plumbing, electrical, carpentry), THE System SHALL store them in worker_skills table
5. WHEN a worker sets hourly rate, THE System SHALL validate rate is within acceptable range (₹100-₹2000)
6. WHEN a Cooperative_Admin views pending workers, THE System SHALL display workers awaiting approval
7. WHEN a Cooperative_Admin approves a worker, THE System SHALL update worker status to "active"
8. WHEN a Cooperative_Admin rejects a worker, THE System SHALL update status to "rejected" with reason
9. WHEN a worker's profile is active, THE System SHALL include them in job matching queries
10. WHERE e-Shram or DigiLocker integration is enabled, THE System SHALL display integration status but use mock data for demo

### Requirement 3: Geospatial Worker Matching

**User Story:** As a Customer, I want the system to find nearby available workers quickly, so that I can get service promptly.

#### Acceptance Criteria

1. WHEN a customer creates a job with location coordinates, THE API SHALL query workers within 10km radius using PostGIS ST_DWithin function
2. WHEN multiple workers are found, THE API SHALL rank them by distance (closest first), rating (highest first), and availability
3. WHEN no workers are found within 10km, THE API SHALL expand search radius to 25km and retry
4. WHEN a worker updates their location, THE System SHALL store coordinates in PostGIS geography column
5. WHEN calculating distance between customer and worker, THE Geospatial_Service SHALL use PostGIS ST_Distance for accuracy
6. WHILE a worker is assigned to an active job, THE System SHALL exclude that worker from matching queries using job status filter
7. WHEN a job requires specific skills, THE API SHALL filter workers by matching skill tags
8. WHEN returning matched workers, THE API SHALL include distance in meters, ETA estimate (distance/40 km/h), and worker rating
9. WHEN no workers match skill requirements, THE API SHALL return empty list with appropriate message

### Requirement 4: Job Lifecycle Management

**User Story:** As a Customer, I want to create service requests and track their progress, so that I know when help will arrive and when work is complete.

#### Acceptance Criteria

1. WHEN a customer submits a job with service type, location, description, and optional photos, THE API SHALL validate required fields and create job record with status "pending"
2. WHEN a job is created, THE API SHALL call matching algorithm to find top 3 nearby workers with required skills
3. WHEN matched workers are found, THE API SHALL return job ID and matched worker list to frontend
4. WHEN a worker accepts a job via API call, THE System SHALL update job status to "accepted" and assign worker_id
5. WHEN a job is accepted, THE API SHALL update all other workers' offers to "expired" for that job
6. WHEN a worker marks job as "in_progress", THE API SHALL update job status and timestamp
7. WHEN a worker marks job as "completed", THE API SHALL update status to "pending_verification" and notify customer
8. WHEN a customer confirms completion, THE API SHALL update job status to "completed" and create payment record
9. WHEN a customer disputes completion, THE API SHALL update status to "disputed" for admin review
10. WHEN a customer uploads problem photos during job creation, THE System SHALL store files in Supabase Storage and link URLs to job
11. WHEN fetching job details, THE API SHALL return job with embedded worker info, location, photos, and status history
12. WHERE scheduling is enabled, WHEN a customer schedules a future job, THE System SHALL store scheduled_time and display as "scheduled" status

### Requirement 5: Payment Flow Simulation

**User Story:** As a Customer, I want to complete payment for services, so that workers are compensated and I have transaction records.

#### Acceptance Criteria

1. WHEN a job is marked completed, THE API SHALL calculate total amount based on hourly_rate × duration_hours
2. WHEN customer initiates payment, THE API SHALL create payment record with status "pending" and amount breakdown
3. WHEN payment is simulated as successful, THE API SHALL update payment status to "completed" and split amount: 85% to worker wallet, 15% to cooperative
4. WHEN payment is simulated as failed, THE API SHALL update status to "failed" with error message
5. WHEN a worker views wallet balance, THE API SHALL sum all completed payment credits
6. WHEN a worker requests payout, THE API SHALL create payout request record with status "pending" for admin approval
7. WHEN admin approves payout, THE API SHALL update status to "completed" and deduct from worker wallet
8. WHEN viewing transaction history, THE API SHALL return paginated list of all payments with job details
9. WHERE dynamic pricing is enabled, WHEN calculating price, THE API SHALL apply surge multiplier stored in config table
10. WHEN generating invoice data, THE API SHALL include job details, worker info, amount breakdown, and GST calculation (18%)
11. WHERE Razorpay test mode is integrated, THE API SHALL provide Razorpay order ID for frontend integration but accept simulated success/failure

### Requirement 6: Rating and Review System

**User Story:** As a Customer, I want to rate workers after service completion, so that high-quality workers are recognized and others can make informed decisions.

#### Acceptance Criteria

1. WHEN a job is completed, THE API SHALL allow customer to submit rating (1-5 stars) and optional review text
2. WHEN a customer submits review, THE API SHALL validate rating is between 1-5 and create review record
3. WHEN a review is created, THE API SHALL recalculate worker's average rating using aggregate query
4. WHEN a worker receives rating below 3 stars, THE System SHALL flag worker profile for admin attention
5. WHEN fetching worker profile, THE API SHALL return average rating and total review count
6. WHEN fetching worker reviews, THE API SHALL return paginated list with customer names anonymized (e.g., "Customer A", "Customer B")
7. WHEN a worker responds to review, THE API SHALL store response text and link to original review
8. WHEN calculating average rating, THE API SHALL use simple mean of all ratings (hackathon simplification)
9. WHEN displaying workers in search results, THE API SHALL include average_rating and review_count in response

### Requirement 7: Real-Time Job Status Updates

**User Story:** As a Customer, I want to see real-time job status updates, so that I'm always informed about my service request.

#### Acceptance Criteria

1. WHEN a job status changes, THE Real_Time_Service SHALL broadcast update to subscribed clients via WebSocket or Supabase Realtime
2. WHEN a customer views job details page, THE frontend SHALL subscribe to job updates using job_id channel
3. WHEN a worker accepts a job, THE Real_Time_Service SHALL push update with worker details to customer
4. WHEN job status changes to "in_progress", "completed", or "disputed", THE Real_Time_Service SHALL push status update immediately
5. WHERE Supabase Realtime is used, WHEN job record is updated, THE System SHALL use Supabase's built-in realtime subscriptions
6. WHERE Socket.io is used, WHEN client connects, THE System SHALL authenticate connection using JWT token
7. WHEN worker location updates during active job, THE Real_Time_Service SHALL broadcast new coordinates every 30 seconds (demo frequency)
8. WHEN WebSocket connection fails, THE frontend SHALL fall back to polling API every 15 seconds
9. WHEN customer is within 500m of worker, THE System SHALL trigger "worker nearby" notification (calculated on location update)

### Requirement 8: Basic Notification System

**User Story:** As a user, I want to receive notifications about important job updates, so that I stay informed without constantly checking the app.

#### Acceptance Criteria

1. WHEN a worker receives job offer, THE System SHALL create in-app notification record with type "job_offer"
2. WHEN a customer's job is accepted, THE System SHALL create notification with worker details and acceptance time
3. WHEN job status changes to "in_progress", "completed", or "disputed", THE System SHALL create notification for relevant user
4. WHEN fetching notifications, THE API SHALL return unread notifications first, then read notifications
5. WHEN a user marks notification as read, THE API SHALL update read_at timestamp
6. WHEN payment is completed, THE System SHALL create notification for both customer and worker with transaction details
7. WHERE push notifications are enabled (future enhancement), THE System SHALL store FCM tokens and integrate with Firebase Cloud Messaging
8. WHERE email notifications are desired, THE API SHALL provide webhook endpoints for Supabase email triggers
9. WHEN notification is created, THE API SHALL include deep link data for frontend navigation (e.g., /jobs/123)

### Requirement 9: ML Demand Forecasting API (Synthetic Data)

**User Story:** As a Cooperative Admin, I want to see predicted service demand, so that I can plan worker availability and recruitment.

#### Acceptance Criteria

1. WHEN the API endpoint /api/forecast/demand is called, THE ML_Service SHALL return demand predictions for next 7 days by service category
2. WHEN generating forecasts, THE API SHALL use synthetic data algorithm that mimics realistic patterns (weekday/weekend variations)
3. WHEN returning forecast data, THE API SHALL include date, service_category, predicted_jobs, confidence_score (mock value 0.7-0.9)
4. WHEN historical data exists in database, THE API SHALL display that data alongside synthetic forecasts to show "learning"
5. WHEN forecast is requested for specific area, THE API SHALL filter results by cooperative_id or geographic region
6. WHERE time-series visualization is needed, THE API SHALL return data in format compatible with Chart.js or similar libraries
7. WHEN displaying forecasts on dashboard, THE frontend SHALL show line charts with service categories color-coded
8. WHEN synthetic data is generated, THE algorithm SHALL include seasonal patterns (higher demand on weekends for home repairs)
9. WHERE advanced ML is added later, THE API structure SHALL support swapping synthetic implementation with real ML model

### Requirement 10: Skill Gap Analysis API (Synthetic Data)

**User Story:** As a Cooperative Admin, I want to identify skill shortages in my area, so that I can recruit or train workers in high-demand categories.

#### Acceptance Criteria

1. WHEN the API endpoint /api/analytics/skill-gaps is called, THE System SHALL analyze job requests vs available workers by skill category
2. WHEN analyzing gaps, THE API SHALL calculate unfilled_job_rate = (pending_jobs / total_jobs) per service category
3. WHEN gaps are identified, THE API SHALL rank service categories by shortage severity (descending order)
4. WHEN returning results, THE API SHALL include service_category, total_jobs, unfilled_jobs, available_workers, shortage_score
5. WHEN a category has >30% unfilled rate, THE API SHALL flag it as "critical_shortage"
6. WHEN displaying on dashboard, THE frontend SHALL show bar charts comparing demand vs supply per category
7. WHERE geographic filtering is applied, THE API SHALL aggregate data by cooperative or city boundaries
8. WHERE training recommendations are requested, THE API SHALL suggest top 3 categories with highest ROI (demand/supply ratio)
9. WHEN synthetic data generation is used, THE algorithm SHALL create realistic imbalances (e.g., high electrician demand, low carpenter demand)

### Requirement 11: Cooperative Admin Dashboard Backend

**User Story:** As a Cooperative Admin, I want backend APIs to power my dashboard, so that I can monitor operations and manage workers.

#### Acceptance Criteria

1. WHEN admin calls /api/admin/dashboard, THE API SHALL return summary metrics: total_jobs, active_workers, pending_verifications, total_revenue
2. WHEN admin views worker management, THE API SHALL return paginated worker list with filters (status, skills, rating)
3. WHEN admin searches workers, THE API SHALL support search by name, phone, skills using SQL LIKE or full-text search
4. WHEN admin views job monitoring, THE API SHALL return all jobs with status breakdown (pending, in_progress, completed, disputed)
5. WHEN admin views financial overview, THE API SHALL aggregate total revenue, cooperative earnings (15%), pending payouts
6. WHEN admin views disputes, THE API SHALL return jobs with status "disputed" including customer complaint text
7. WHEN admin resolves dispute in favor of customer, THE API SHALL update job status to "refunded" and reverse payment transactions
8. WHEN admin resolves dispute in favor of worker, THE API SHALL update status to "completed" and maintain payment
9. WHEN admin approves worker verification, THE API SHALL update worker status from "pending" to "active"
10. WHEN admin exports data, THE API SHALL return CSV format with filtered date ranges for jobs, workers, or transactions
11. WHERE analytics are requested, THE API SHALL calculate completion rate = (completed_jobs / total_jobs), average rating per worker category

### Requirement 12: File Upload and Storage

**User Story:** As a user, I want to upload photos and documents, so that I can share job details and verification documents.

#### Acceptance Criteria

1. WHEN a user uploads a file, THE API SHALL validate file type is in allowed list (jpg, png, jpeg, pdf, webp)
2. WHEN a user uploads a file, THE API SHALL validate file size is below 5MB
3. WHEN file passes validation, THE API SHALL upload to Supabase Storage bucket and return public URL
4. WHEN file upload fails, THE API SHALL return error message with specific reason (size, type, network)
5. WHEN a worker uploads profile photo, THE API SHALL store in "profile-photos" bucket and update worker.profile_image_url
6. WHEN a customer uploads job photos, THE API SHALL store in "job-images" bucket and link to job via job_images table
7. WHEN a worker uploads KYC document, THE API SHALL store in "documents" bucket with restricted access (admin-only)
8. WHEN displaying uploaded images, THE frontend SHALL use Supabase Storage public URLs with appropriate permissions
9. WHEN accessing KYC documents, THE API SHALL verify requester is admin using JWT role check
10. WHERE image optimization is desired, THE API SHALL support thumbnail generation using Supabase Image Transformation

### Requirement 13: Progressive Web App (PWA) Backend Support

**User Story:** As a mobile user, I want the app to work offline and feel like a native app, so that I can access features without constant internet.

#### Acceptance Criteria

1. WHEN the API serves manifest.json, THE System SHALL include app name, icons, theme colors, and display mode "standalone"
2. WHEN the API serves service worker file, THE System SHALL include caching strategies for static assets and API responses
3. WHEN a client makes API request while offline, THE service worker SHALL return cached response if available
4. WHEN a client comes back online, THE service worker SHALL sync pending requests (background sync)
5. WHEN critical data is fetched, THE API SHALL include appropriate cache headers (max-age, etag)
6. WHERE push notifications are enabled, THE API SHALL provide /api/notifications/subscribe endpoint to register service worker subscriptions
7. WHEN serving PWA assets, THE API SHALL set correct MIME types and enable CORS for cross-origin requests
8. WHEN user installs PWA, THE manifest SHALL configure splash screen and app icon for home screen
9. WHERE offline job creation is desired, THE service worker SHALL queue job creation requests and sync when online

### Requirement 14: Database Schema and Data Integrity

**User Story:** As a developer, I want a well-designed database schema, so that data is consistent and queries are fast.

#### Acceptance Criteria

1. WHEN database is initialized, THE System SHALL create tables: users, workers, cooperatives, jobs, reviews, payments, notifications with foreign key constraints
2. WHEN storing location data, THE System SHALL use PostGIS geography column type (POINT) for latitude/longitude
3. WHEN a job is deleted, THE System SHALL cascade soft-delete (set deleted_at timestamp) to preserve audit trail
4. WHEN storing timestamps, THE System SHALL use timestamptz (timestamp with timezone) in UTC
5. WHEN creating indexes, THE System SHALL add GIST index on worker.location for spatial queries
6. WHEN creating indexes, THE System SHALL add B-tree indexes on frequently queried columns (user_id, status, created_at)
7. WHEN a worker profile is updated, THE System SHALL store previous values in audit_log table with changed_by user_id
8. WHEN inserting job records, THE System SHALL validate foreign keys exist (worker_id references workers, customer_id references users)
9. WHEN querying jobs with filters, THE System SHALL use indexed columns to optimize performance
10. WHERE full-text search is needed, THE System SHALL create GIN index on searchable text columns (job.description, worker.bio)

### Requirement 15: RESTful API Design and Documentation

**User Story:** As a frontend developer, I want well-structured API endpoints with clear documentation, so that I can integrate features easily.

#### Acceptance Criteria

1. WHEN API is structured, THE System SHALL organize routes by resource: /api/auth, /api/jobs, /api/workers, /api/admin, /api/payments
2. WHEN designing endpoints, THE API SHALL follow REST conventions: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
3. WHEN returning responses, THE API SHALL use consistent JSON structure: {success, data, error, message}
4. WHEN errors occur, THE API SHALL return appropriate HTTP status codes (400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error)
5. WHEN pagination is needed, THE API SHALL accept query params ?page=1&limit=20 and return total_count in response
6. WHEN filtering is needed, THE API SHALL support query params like ?status=active&skill=plumbing
7. WHEN sorting is needed, THE API SHALL support ?sort_by=created_at&order=desc
8. WHERE API documentation is provided, THE System SHALL use Swagger/OpenAPI or Postman collection
9. WHEN CORS is configured, THE API SHALL allow requests from frontend domain with credentials
10. WHEN versioning is considered, THE API SHALL use /api/v1 prefix for future compatibility

### Requirement 16: Basic Security and Validation

**User Story:** As a developer, I want basic security measures, so that the demo is reasonably secure without over-engineering.

#### Acceptance Criteria

1. WHEN API endpoints require authentication, THE System SHALL validate JWT token in Authorization header
2. WHEN processing user input, THE API SHALL validate required fields and data types using validation library (Joi, Zod, class-validator)
3. WHEN user submits forms, THE API SHALL sanitize inputs to prevent XSS (escape HTML special characters)
4. WHEN storing passwords (if email auth with password), THE System SHALL hash using bcrypt with salt rounds 10
5. WHEN rate limiting is applied, THE API SHALL limit to 100 requests per minute per IP for public endpoints
6. WHEN serving API over HTTP in dev, THE System SHALL configure HTTPS for production deployment
7. WHEN handling file uploads, THE API SHALL validate MIME types match file extensions
8. WHEN CORS is enabled, THE API SHALL whitelist frontend origin domains
9. WHERE SQL queries use user input, THE API SHALL use parameterized queries or ORM to prevent SQL injection

---

## Hackathon Implementation Strategy

Given the 30-35 hour development timeline and hackathon context, implementation will be prioritized for maximum visual impact and feature completeness:

**Technology Stack (Recommended for Speed):**
- **Backend**: Node.js with Express (simple) or NestJS (structured)
- **Database**: Supabase PostgreSQL (free tier, includes PostGIS, Auth, Storage, Realtime)
- **Authentication**: Supabase Auth (email-based, pre-built)
- **Real-time**: Supabase Realtime (built-in) or Socket.io
- **File Storage**: Supabase Storage (integrated)
- **Payment**: Simulated/mock with optional Razorpay test mode
- **ML**: Synthetic data generators (simple algorithms mimicking realistic patterns)
- **Deployment**: Vercel/Netlify (frontend) + Railway/Render (backend) - all free tiers

**Phase 1 - Core Flow (12-15 hours):**
- Requirements 1, 2, 4, 14, 15 (Auth, Worker Profiles, Job Lifecycle, Database, API Structure)
- **Demo capability**: User registration → Worker onboarding → Create job → View jobs
- **Critical for judges**: Shows complete user flow with real data persistence

**Phase 2 - Key Differentiators (10-12 hours):**
- Requirements 3, 5, 6, 12 (Geospatial Matching, Payments, Reviews, File Upload)
- **Demo capability**: Location-based worker finding → Payment simulation → Rating system → Photo uploads
- **Critical for judges**: Shows technical sophistication (PostGIS) and complete transaction loop

**Phase 3 - Impressive Features (8-10 hours):**
- Requirements 7, 8, 9, 10, 11 (Real-time, Notifications, ML Forecasting, Skill Gaps, Admin Dashboard)
- **Demo capability**: Live status updates → Smart analytics → Admin controls
- **Critical for judges**: Shows innovation (ML insights) and completeness (admin features)

**Phase 4 - Polish (Optional, if time permits):**
- Requirements 13, 16 (PWA, Security hardening)
- **Demo capability**: Install as app → Offline support
- **Critical for judges**: Shows modern web capabilities

**Deferred for Post-Hackathon:**
- Production monitoring, CI/CD pipelines, comprehensive security audits
- Load testing, performance optimization beyond basic indexing
- Mobile native apps (PWA is sufficient for demo)
- Government API integrations (e-Shram, DigiLocker - use UI mockups)
- SMS/Email notifications (in-app notifications sufficient)
- Background verification checks (admin approval flow sufficient)

**Success Metrics for Judges:**
1. ✅ Complete user journey works end-to-end (customer can book, worker can accept, payment processed, review submitted)
2. ✅ Technical sophistication visible (geospatial queries, real-time updates, ML insights)
3. ✅ Visual completeness (all frontend screens have working backend APIs)
4. ✅ Scalability foundations present (proper database schema, RESTful API, auth system)
5. ✅ Innovation showcased (demand forecasting, skill gap analysis, location-based matching)

**Hackathon Shortcuts That Look Professional:**
- Synthetic ML data with realistic patterns (judges won't know it's not real ML)
- Payment simulation that shows transaction flow (test mode/mock gateway)
- In-app notifications instead of SMS/email (saves integration time)
- Admin approval for verification instead of government API integration
- Supabase Auth instead of custom OTP system (faster, equally impressive)
- PWA instead of native mobile apps (same UX, fraction of effort)

This approach maximizes feature count and visual impressiveness while maintaining code quality and architectural soundness.
