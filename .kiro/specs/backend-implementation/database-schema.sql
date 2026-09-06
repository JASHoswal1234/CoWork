-- SAHAKAR // SERVICES - Complete Database Schema
-- PostgreSQL with PostGIS extension for geospatial features

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE job_status AS ENUM ('pending', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'expert');
CREATE TYPE training_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (base table for all roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- OTP verification table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'registration', 'login', 'reset_password'
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- ============================================
-- WORKER TABLES
-- ============================================

-- Worker profiles
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url VARCHAR(500),
    location GEOGRAPHY(POINT, 4326), -- PostGIS geography type
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    service_radius INTEGER DEFAULT 10, -- in kilometers
    available BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    member_since DATE DEFAULT CURRENT_DATE,
    today_earnings DECIMAL(10, 2) DEFAULT 0.0,
    month_earnings DECIMAL(10, 2) DEFAULT 0.0,
    total_earnings DECIMAL(12, 2) DEFAULT 0.0,
    cooperative_share DECIMAL(3, 2) DEFAULT 0.15, -- 15%
    verification_status verification_status DEFAULT 'pending',
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for geospatial queries (CRITICAL for performance)
CREATE INDEX idx_workers_location ON workers USING GIST(location);
CREATE INDEX idx_workers_user ON workers(user_id);
CREATE INDEX idx_workers_available ON workers(available);
CREATE INDEX idx_workers_city ON workers(city);

-- Worker skills
CREATE TABLE worker_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- Plumbing, Electrical, etc.
    subcategory VARCHAR(100), -- Pipe Fitting, Leak Repair, etc.
    verified BOOLEAN DEFAULT FALSE,
    verification_date DATE,
    skill_level skill_level DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_skills_worker ON worker_skills(worker_id);
CREATE INDEX idx_worker_skills_category ON worker_skills(category);
CREATE UNIQUE INDEX idx_worker_skills_unique ON worker_skills(worker_id, category, subcategory);

-- Worker certifications
CREATE TABLE worker_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_certifications_worker ON worker_certifications(worker_id);

-- Worker training modules
CREATE TABLE worker_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    module_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status training_status DEFAULT 'not_started',
    progress INTEGER DEFAULT 0, -- 0-100
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_training_worker ON worker_training(worker_id);

-- Worker documents (KYC, ID proofs, etc.)
CREATE TABLE worker_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'driving_license', 'photo'
    document_url VARCHAR(500) NOT NULL,
    verification_status verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_documents_worker ON worker_documents(worker_id);

-- Worker availability schedule (optional - for future scheduled bookings)
CREATE TABLE worker_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_availability_worker ON worker_availability(worker_id);

-- ============================================
-- SERVICE TABLES
-- ============================================

-- Service categories
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    avg_price_min DECIMAL(10, 2),
    avg_price_max DECIMAL(10, 2),
    avg_duration_min INTEGER, -- in minutes
    avg_duration_max INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_categories_active ON service_categories(is_active);

-- Service subcategories
CREATE TABLE service_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_min DECIMAL(10, 2) NOT NULL,
    price_max DECIMAL(10, 2) NOT NULL,
    duration_min INTEGER NOT NULL, -- in minutes
    duration_max INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_subcategories_category ON service_subcategories(category_id);

-- Required skills for each subcategory
CREATE TABLE service_required_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subcategory_id UUID NOT NULL REFERENCES service_subcategories(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);

CREATE INDEX idx_service_required_skills_subcategory ON service_required_skills(subcategory_id);

-- ============================================
-- JOB TABLES
-- ============================================

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable ID: JOB-2024-0001
    customer_id UUID NOT NULL REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    customer_location GEOGRAPHY(POINT, 4326),
    customer_address TEXT NOT NULL,
    
    service_category_id UUID NOT NULL REFERENCES service_categories(id),
    service_subcategory_id UUID REFERENCES service_subcategories(id),
    service_category_name VARCHAR(100) NOT NULL, -- Denormalized for performance
    service_subcategory_name VARCHAR(100),
    
    description TEXT NOT NULL,
    problem_image_urls TEXT[], -- Array of image URLs
    
    worker_id UUID REFERENCES workers(id),
    assigned_at TIMESTAMP,
    
    status job_status DEFAULT 'pending',
    
    scheduled_at TIMESTAMP, -- NULL for immediate/on-demand
    is_immediate BOOLEAN DEFAULT TRUE,
    
    estimated_duration INTEGER, -- in minutes
    estimated_price DECIMAL(10, 2) NOT NULL,
    actual_price DECIMAL(10, 2),
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_date TIMESTAMP,
    
    worker_earnings DECIMAL(10, 2),
    cooperative_share DECIMAL(10, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_worker ON jobs(worker_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs USING GIST(customer_location);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_category ON jobs(service_category_id);

-- Job status history (audit trail)
CREATE TABLE job_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    from_status job_status,
    to_status job_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_status_history_job ON job_status_history(job_id);

-- Job dispatch attempts (for analytics)
CREATE TABLE job_dispatch_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id),
    distance_km DECIMAL(6, 2),
    estimated_arrival_min INTEGER,
    dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response VARCHAR(20), -- 'accepted', 'rejected', 'timeout'
    response_at TIMESTAMP
);

CREATE INDEX idx_job_dispatch_job ON job_dispatch_attempts(job_id);
CREATE INDEX idx_job_dispatch_worker ON job_dispatch_attempts(worker_id);

-- ============================================
-- PAYMENT TABLES
-- ============================================

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    worker_id UUID REFERENCES workers(id),
    
    amount DECIMAL(10, 2) NOT NULL,
    worker_earnings DECIMAL(10, 2) NOT NULL,
    cooperative_share DECIMAL(10, 2) NOT NULL,
    
    payment_method VARCHAR(50), -- 'razorpay', 'wallet', 'cash'
    payment_gateway VARCHAR(50), -- 'razorpay', 'stripe'
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_signature VARCHAR(500),
    
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP,
    
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_job ON payments(job_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_worker ON payments(worker_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Worker wallet/earnings
CREATE TABLE worker_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID UNIQUE NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) DEFAULT 0.0,
    total_earned DECIMAL(12, 2) DEFAULT 0.0,
    total_withdrawn DECIMAL(12, 2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_wallets_worker ON worker_wallets(worker_id);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES worker_wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'credit', 'debit', 'withdrawal', 'refund'
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    job_id UUID REFERENCES jobs(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

-- Payout requests
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(100),
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    transaction_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payout_requests_worker ON payout_requests(worker_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);

-- ============================================
-- NOTIFICATION TABLES
-- ============================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'job_request', 'job_accepted', 'payment', 'review'
    related_job_id UUID REFERENCES jobs(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_via VARCHAR(50)[], -- ['push', 'sms', 'email']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Push notification tokens (FCM/APNS)
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'android', 'ios', 'web'
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE UNIQUE INDEX idx_push_tokens_token ON push_tokens(token);

-- ============================================
-- ANALYTICS & ML TABLES
-- ============================================

-- Demand forecasts (for AI/ML feature)
CREATE TABLE demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_category_id UUID NOT NULL REFERENCES service_categories(id),
    forecast_date DATE NOT NULL,
    city VARCHAR(100),
    predicted_demand INTEGER NOT NULL,
    confidence_level DECIMAL(3, 2), -- 0.0 to 1.0
    available_workers INTEGER,
    gap INTEGER, -- predicted_demand - available_workers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demand_forecasts_date ON demand_forecasts(forecast_date);
CREATE INDEX idx_demand_forecasts_category ON demand_forecasts(service_category_id);

-- Skill gap analysis
CREATE TABLE skill_gap_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    city VARCHAR(100),
    current_workers INTEGER NOT NULL,
    required_workers INTEGER NOT NULL,
    gap INTEGER NOT NULL,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    recommended_training TEXT[],
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skill_gap_date ON skill_gap_analyses(analysis_date);

-- ============================================
-- AUDIT & LOGGING TABLES
-- ============================================

-- Admin audit log
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'worker', 'job', 'payment'
    entity_id UUID NOT NULL,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_created ON admin_audit_log(created_at DESC);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate job number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.job_number := 'JOB-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                      LPAD(NEXTVAL('job_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE job_number_seq START 1;

CREATE TRIGGER generate_job_number_trigger BEFORE INSERT ON jobs
    FOR EACH ROW EXECUTE FUNCTION generate_job_number();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert default service categories
INSERT INTO service_categories (name, icon, description, avg_price_min, avg_price_max, avg_duration_min, avg_duration_max, display_order) VALUES
('Plumbing', 'plumbing', 'Professional plumbing services', 500, 2000, 60, 120, 1),
('Electrical', 'electrical', 'Licensed electrical services', 800, 3000, 60, 180, 2),
('Carpentry', 'carpentry', 'Expert carpentry services', 1000, 4000, 120, 240, 3),
('Painting', 'painting', 'Professional painting services', 2000, 8000, 240, 480, 4),
('Cleaning', 'cleaning', 'Comprehensive cleaning services', 1000, 3000, 120, 240, 5),
('Appliance Repair', 'repair', 'Repair and maintenance services', 600, 2000, 60, 120, 6);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Find nearest available workers for a location
-- COMMENT ON QUERY IS:
-- SELECT w.*, ST_Distance(w.location, ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography) / 1000 AS distance_km
-- FROM workers w
-- WHERE w.available = TRUE
--   AND ST_DWithin(w.location,