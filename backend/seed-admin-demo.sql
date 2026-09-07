-- ============================================================================
-- SAHAKAR // SERVICES - ADMIN DASHBOARD HISTORICAL DATA SEED
-- File: backend/seed-admin-demo.sql
-- 
-- IDEMPOTENT & SAFE TO RE-RUN:
-- Populates the database with realistic completed-job history, matching
-- payments, and wallet transactions so the Admin Dashboard displays
-- authentic 15% platform earnings, workforce performance, and job telemetry.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cooperative_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    distribution_period VARCHAR(50) NOT NULL,
    eligible_work_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    work_share_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    cooperative_pool_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    distribution_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_worker_distribution_period UNIQUE (worker_id, distribution_period)
);

CREATE INDEX IF NOT EXISTS idx_coop_dist_worker_id ON public.cooperative_distributions(worker_id);
CREATE INDEX IF NOT EXISTS idx_coop_dist_period ON public.cooperative_distributions(distribution_period);

BEGIN;

DO $$
DECLARE
    -- Customer variables
    v_cust_id UUID;
    v_cust_name TEXT;
    v_cust_phone TEXT;
    
    -- Category IDs
    v_cat_plumb UUID;
    v_cat_elec UUID;
    v_cat_carp UUID;
    v_cat_paint UUID;
    v_cat_clean UUID;
    v_cat_appl UUID;
    
    -- Worker IDs and Wallet IDs
    v_w_plumb UUID; v_wal_plumb UUID;
    v_w_elec UUID;  v_wal_elec UUID;
    v_w_carp UUID;  v_wal_carp UUID;
    v_w_paint UUID; v_wal_paint UUID;
    v_w_clean UUID; v_wal_clean UUID;
    v_w_appl UUID;  v_wal_appl UUID;

    -- Counters and variables for seed insertion
    v_existing_demo_count INT;
    v_new_job_id UUID;
    v_price NUMERIC;
    v_w_earn NUMERIC;
    v_coop_share NUMERIC;
    v_completed_time TIMESTAMPTZ;
    v_cur_bal NUMERIC;

    -- Cooperative distribution variables
    v_tot_rev NUMERIC := 0;
    v_coop_pool NUMERIC := 0;
    v_w_work NUMERIC := 0;
    v_w_share_pct NUMERIC := 0;
    v_w_dist NUMERIC := 0;
    v_dist_w_id UUID;
    v_dist_wal_id UUID;
BEGIN
    -- 1. Check if demo seed has already run to guarantee idempotency
    SELECT COUNT(*) INTO v_existing_demo_count FROM public.jobs WHERE job_number LIKE 'DEMO-HIST-%';
    
    IF v_existing_demo_count >= 30 THEN
        RAISE NOTICE 'Demo historical jobs already exist (% found). Skipping re-insertion to prevent duplicate records.', v_existing_demo_count;
        RETURN;
    END IF;

    -- Clean up any partial historical seed if re-running
    IF v_existing_demo_count > 0 THEN
        DELETE FROM public.wallet_transactions WHERE job_id IN (SELECT id FROM public.jobs WHERE job_number LIKE 'DEMO-HIST-%') OR description ILIKE '%demo-historical-2026-09%';
        DELETE FROM public.cooperative_distributions WHERE distribution_period = 'demo-historical-2026-09';
        DELETE FROM public.payments WHERE job_id IN (SELECT id FROM public.jobs WHERE job_number LIKE 'DEMO-HIST-%');
        DELETE FROM public.jobs WHERE job_number LIKE 'DEMO-HIST-%';
    END IF;

    -- 2. Resolve existing Customer
    SELECT id, name, phone INTO v_cust_id, v_cust_name, v_cust_phone
    FROM public.users
    WHERE role = 'customer'
    LIMIT 1;

    IF v_cust_id IS NULL THEN
        -- Fallback: select any non-worker/admin user or create fallback profile
        SELECT id, name, phone INTO v_cust_id, v_cust_name, v_cust_phone FROM public.users LIMIT 1;
    END IF;

    IF v_cust_name IS NULL THEN v_cust_name := 'Priya Sharma'; END IF;
    IF v_cust_phone IS NULL THEN v_cust_phone := '+919876543210'; END IF;

    -- 3. Resolve Service Categories
    SELECT id INTO v_cat_plumb FROM public.service_categories WHERE name ILIKE '%Plumb%' LIMIT 1;
    SELECT id INTO v_cat_elec FROM public.service_categories WHERE name ILIKE '%Electr%' LIMIT 1;
    SELECT id INTO v_cat_carp FROM public.service_categories WHERE name ILIKE '%Carpent%' LIMIT 1;
    SELECT id INTO v_cat_paint FROM public.service_categories WHERE name ILIKE '%Paint%' LIMIT 1;
    SELECT id INTO v_cat_clean FROM public.service_categories WHERE name ILIKE '%Clean%' LIMIT 1;
    SELECT id INTO v_cat_appl FROM public.service_categories WHERE name ILIKE '%Appliance%' LIMIT 1;

    -- 4. Resolve Workers by Skill Domain
    -- Plumbing Worker
    SELECT w.id INTO v_w_plumb FROM public.workers w
    LEFT JOIN public.worker_skills ws ON ws.worker_id = w.id
    WHERE ws.category ILIKE '%Plumb%' OR w.id IN (SELECT worker_id FROM public.worker_skills WHERE category ILIKE '%Plumb%')
    LIMIT 1;
    IF v_w_plumb IS NULL THEN SELECT id INTO v_w_plumb FROM public.workers LIMIT 1; END IF;

    -- Electrical Worker
    SELECT w.id INTO v_w_elec FROM public.workers w
    LEFT JOIN public.worker_skills ws ON ws.worker_id = w.id
    WHERE ws.category ILIKE '%Electr%' AND w.id <> COALESCE(v_w_plumb, '00000000-0000-0000-0000-000000000000'::uuid)
    LIMIT 1;
    IF v_w_elec IS NULL THEN SELECT id INTO v_w_elec FROM public.workers WHERE id <> COALESCE(v_w_plumb, '00000000-0000-0000-0000-000000000000'::uuid) LIMIT 1; END IF;
    IF v_w_elec IS NULL THEN v_w_elec := v_w_plumb; END IF;

    -- Carpentry Worker
    SELECT w.id INTO v_w_carp FROM public.workers w
    LEFT JOIN public.worker_skills ws ON ws.worker_id = w.id
    WHERE ws.category ILIKE '%Carpent%' AND w.id NOT IN (COALESCE(v_w_plumb, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(v_w_elec, '00000000-0000-0000-0000-000000000000'::uuid))
    LIMIT 1;
    IF v_w_carp IS NULL THEN SELECT id INTO v_w_carp FROM public.workers LIMIT 1; END IF;

    -- Painting Worker
    SELECT w.id INTO v_w_paint FROM public.workers w
    LEFT JOIN public.worker_skills ws ON ws.worker_id = w.id
    WHERE ws.category ILIKE '%Paint%'
    LIMIT 1;
    IF v_w_paint IS NULL THEN SELECT id INTO v_w_paint FROM public.workers LIMIT 1; END IF;

    -- Cleaning Worker
    SELECT w.id INTO v_w_clean FROM public.workers w
    LEFT JOIN public.worker_skills ws ON ws.worker_id = w.id
    WHERE ws.category ILIKE '%Clean%'
    LIMIT 1;
    IF v_w_clean IS NULL THEN SELECT id INTO v_w_clean FROM public.workers LIMIT 1; END IF;

    -- Appliance Repair Worker
    SELECT w.id INTO v_w_appl FROM public.workers w
    LEFT JOIN public.worker_skills ws ON ws.worker_id = w.id
    WHERE ws.category ILIKE '%Appliance%'
    LIMIT 1;
    IF v_w_appl IS NULL THEN SELECT id INTO v_w_appl FROM public.workers LIMIT 1; END IF;

    -- 5. Resolve Wallets for Each Worker
    SELECT id, balance INTO v_wal_plumb, v_cur_bal FROM public.worker_wallets WHERE worker_id = v_w_plumb LIMIT 1;
    IF v_wal_plumb IS NULL AND v_w_plumb IS NOT NULL THEN
        INSERT INTO public.worker_wallets (worker_id, balance, total_earned, total_withdrawn)
        VALUES (v_w_plumb, 1500, 1500, 0) RETURNING id INTO v_wal_plumb;
    END IF;

    SELECT id INTO v_wal_elec FROM public.worker_wallets WHERE worker_id = v_w_elec LIMIT 1;
    IF v_wal_elec IS NULL AND v_w_elec IS NOT NULL THEN
        INSERT INTO public.worker_wallets (worker_id, balance, total_earned, total_withdrawn)
        VALUES (v_w_elec, 1800, 1800, 0) RETURNING id INTO v_wal_elec;
    END IF;

    SELECT id INTO v_wal_carp FROM public.worker_wallets WHERE worker_id = v_w_carp LIMIT 1;
    IF v_wal_carp IS NULL AND v_w_carp IS NOT NULL THEN
        INSERT INTO public.worker_wallets (worker_id, balance, total_earned, total_withdrawn)
        VALUES (v_w_carp, 1200, 1200, 0) RETURNING id INTO v_wal_carp;
    END IF;

    SELECT id INTO v_wal_paint FROM public.worker_wallets WHERE worker_id = v_w_paint LIMIT 1;
    IF v_wal_paint IS NULL AND v_w_paint IS NOT NULL THEN
        INSERT INTO public.worker_wallets (worker_id, balance, total_earned, total_withdrawn)
        VALUES (v_w_paint, 2000, 2000, 0) RETURNING id INTO v_wal_paint;
    END IF;

    SELECT id INTO v_wal_clean FROM public.worker_wallets WHERE worker_id = v_w_clean LIMIT 1;
    IF v_wal_clean IS NULL AND v_w_clean IS NOT NULL THEN
        INSERT INTO public.worker_wallets (worker_id, balance, total_earned, total_withdrawn)
        VALUES (v_w_clean, 1000, 1000, 0) RETURNING id INTO v_wal_clean;
    END IF;

    SELECT id INTO v_wal_appl FROM public.worker_wallets WHERE worker_id = v_w_appl LIMIT 1;
    IF v_wal_appl IS NULL AND v_w_appl IS NOT NULL THEN
        INSERT INTO public.worker_wallets (worker_id, balance, total_earned, total_withdrawn)
        VALUES (v_w_appl, 1600, 1600, 0) RETURNING id INTO v_wal_appl;
    END IF;

    -- ========================================================================
    -- 6. INSERT 36 REALISTIC COMPLETED JOBS ACROSS ALL 6 DOMAINS
    -- ========================================================================

    -- Helper table for batch execution
    CREATE TEMP TABLE tmp_demo_jobs (
        job_num TEXT,
        cat_name TEXT,
        cat_id UUID,
        worker_id UUID,
        wallet_id UUID,
        descr TEXT,
        addr TEXT,
        lat NUMERIC,
        lng NUMERIC,
        price NUMERIC,
        days_back NUMERIC,
        rating INT,
        review_text TEXT
    ) ON COMMIT DROP;

    INSERT INTO tmp_demo_jobs VALUES
    -- ── DOMAIN 1: PLUMBING (6 jobs) ──
    ('DEMO-HIST-001', 'Plumbing', v_cat_plumb, v_w_plumb, v_wal_plumb, 'Kitchen sink drain pipe blockage clearing and tap washer replacement', 'Flat 402, Mayur Colony, Kothrud, Pune', 18.5074, 73.8077, 650.00, 75, 5, 'Quick resolution of the kitchen leak, very polite technician.'),
    ('DEMO-HIST-002', 'Plumbing', v_cat_plumb, v_w_plumb, v_wal_plumb, 'Bathroom shower mixer cartridge replacement and pressure check', 'Row House 12, Baner Road, Baner, Pune', 18.5590, 73.7868, 850.00, 68, 5, 'Clean work and solved our low water pressure issue.'),
    ('DEMO-HIST-003', 'Plumbing', v_cat_plumb, v_w_plumb, v_wal_plumb, 'Overhead water tank float valve and inlet pipe fitting', 'B-14, Green Acre, Wakad, Pune', 18.5975, 73.7898, 1200.00, 52, 4, 'Very professional and came with all the required spares.'),
    ('DEMO-HIST-004', 'Plumbing', v_cat_plumb, v_w_plumb, v_wal_plumb, 'Dual flush cistern repair and toilet seal replacement', 'A-301, Sindh Society, Aundh, Pune', 18.5592, 73.8078, 550.00, 38, 5, 'Prompt arrival within 25 minutes. Fixed without mess.'),
    ('DEMO-HIST-005', 'Plumbing', v_cat_plumb, v_w_plumb, v_wal_plumb, 'Washing machine inlet water point connection and angle cock', 'Skyline Towers, Viman Nagar, Pune', 18.5679, 73.9143, 450.00, 20, 5, 'Excellent cooperative technician. Reasonable pricing.'),
    ('DEMO-HIST-006', 'Plumbing', v_cat_plumb, v_w_plumb, v_wal_plumb, 'Main pipeline concealed leak repair and pressure testing', 'Ghole Road, Shivajinagar, Pune', 18.5308, 73.8474, 1600.00, 6, 5, 'Found the concealed leakage accurately without breaking extra tiles.'),

    -- ── DOMAIN 2: ELECTRICAL (6 jobs) ──
    ('DEMO-HIST-007', 'Electrical', v_cat_elec, v_w_elec, v_wal_elec, 'Main distribution board 32A double pole MCB replacement', 'Paud Road, Kothrud, Pune', 18.5085, 73.8090, 750.00, 72, 5, 'Identified the short circuit instantly and replaced the breaker safely.'),
    ('DEMO-HIST-008', 'Electrical', v_cat_elec, v_w_elec, v_wal_elec, 'Two decorative ceiling fans installation and regulator fitting', 'Pancard Club Road, Baner, Pune', 18.5610, 73.7840, 600.00, 61, 4, 'Well balanced fan installation, no wobbling.'),
    ('DEMO-HIST-009', 'Electrical', v_cat_elec, v_w_elec, v_wal_elec, 'Inverter battery line rewiring and changeover switch setup', 'Datta Mandir Road, Wakad, Pune', 18.5950, 73.7860, 1100.00, 48, 5, 'Clean wiring and demonstrated how the inverter switch works.'),
    ('DEMO-HIST-010', 'Electrical', v_cat_elec, v_w_elec, v_wal_elec, 'Living room warm white LED cob light cutouts and switchboard installation', 'ITI Road, Aundh, Pune', 18.5580, 73.8050, 950.00, 33, 5, 'Great aesthetic lighting advice and very tidy work.'),
    ('DEMO-HIST-011', 'Electrical', v_cat_elec, v_w_elec, v_wal_elec, 'Geyser 16A power socket burnt wire replacement and earthing check', 'Konark Nagar, Viman Nagar, Pune', 18.5660, 73.9120, 500.00, 18, 5, 'Checked earth resistance for safety. Highly recommended.'),
    ('DEMO-HIST-012', 'Electrical', v_cat_elec, v_w_elec, v_wal_elec, 'Complete kitchen appliance wiring load balancing', 'FC Road, Shivajinagar, Pune', 18.5290, 73.8450, 1400.00, 4, 5, 'Prevented tripping issues when using oven and microwave together.'),

    -- ── DOMAIN 3: CARPENTRY (6 jobs) ──
    ('DEMO-HIST-013', 'Carpentry', v_cat_carp, v_w_carp, v_wal_carp, 'Wardrobe hydraulic hinges replacement and sliding door track alignment', 'Ideal Colony, Kothrud, Pune', 18.5060, 73.8050, 900.00, 74, 5, 'Smooth sliding motion restored on heavy wardrobe doors.'),
    ('DEMO-HIST-014', 'Carpentry', v_cat_carp, v_w_carp, v_wal_carp, 'Solid teak wood main entrance door mortise lock installation', 'Veerbhadra Nagar, Baner, Pune', 18.5570, 73.7820, 1100.00, 65, 5, 'High precision lock installation. Clean chiseled finish.'),
    ('DEMO-HIST-015', 'Carpentry', v_cat_carp, v_w_carp, v_wal_carp, 'Custom solid wood kitchen spice rack and drawer organizer fitting', 'Kaspate Vasti, Wakad, Pune', 18.5930, 73.7880, 1450.00, 49, 4, 'Very sturdy craftsmanship.'),
    ('DEMO-HIST-016', 'Carpentry', v_cat_carp, v_w_carp, v_wal_carp, 'King size bed frame creaking fix and ply reinforcement', 'Spicer College Road, Aundh, Pune', 18.5560, 73.8090, 800.00, 35, 5, 'Creaking noise completely gone. Solid job.'),
    ('DEMO-HIST-017', 'Carpentry', v_cat_carp, v_w_carp, v_wal_carp, 'Balcony wooden privacy lattice partition repair and polishing', 'Clover Park, Viman Nagar, Pune', 18.5690, 73.9160, 1300.00, 16, 5, 'Polished to perfection matching our existing decor.'),
    ('DEMO-HIST-018', 'Carpentry', v_cat_carp, v_w_carp, v_wal_carp, 'Study table laminate edge binding and drawer roller replacement', 'Model Colony, Shivajinagar, Pune', 18.5320, 73.8430, 650.00, 3, 5, 'Quick fix on study table drawers.'),

    -- ── DOMAIN 4: PAINTING (6 jobs) ──
    ('DEMO-HIST-019', 'Painting', v_cat_paint, v_w_paint, v_wal_paint, 'Living room ceiling water seepage scraping, primer, and royal emulsion repaint', 'Rambaug Colony, Kothrud, Pune', 18.5090, 73.8060, 2400.00, 70, 5, 'Flawless ceiling finish, covered furniture carefully.'),
    ('DEMO-HIST-020', 'Painting', v_cat_paint, v_w_paint, v_wal_paint, 'Master bedroom metallic texture accent wall painting', 'Balewadi High St, Baner, Pune', 18.5630, 73.7850, 3200.00, 58, 5, 'Stunning metallic pattern design on bedroom wall.'),
    ('DEMO-HIST-021', 'Painting', v_cat_paint, v_w_paint, v_wal_paint, 'Balcony weatherproof exterior anti-fungal paint coating', 'Shankar Kalat Nagar, Wakad, Pune', 18.5960, 73.7840, 1800.00, 44, 4, 'Exterior wall looks brand new and waterproofed.'),
    ('DEMO-HIST-022', 'Painting', v_cat_paint, v_w_paint, v_wal_paint, 'Kitchen wall oil repellent enamel painting and crack filling', 'DP Road, Aundh, Pune', 18.5600, 73.8110, 1650.00, 29, 5, 'Stain resistant finish applied smoothly.'),
    ('DEMO-HIST-023', 'Painting', v_cat_paint, v_w_paint, v_wal_paint, 'Kids bedroom dual tone pastel emulsion painting with stencil border', 'Sakore Nagar, Viman Nagar, Pune', 18.5650, 73.9180, 2800.00, 14, 5, 'Kids loved the pastel theme and animal stencil border!'),
    ('DEMO-HIST-024', 'Painting', v_cat_paint, v_w_paint, v_wal_paint, 'Wooden doors and window frames PU gloss clear varnish polishing', 'JM Road, Shivajinagar, Pune', 18.5280, 73.8490, 2100.00, 2, 5, 'Brought back the natural wood grain luster.'),

    -- ── DOMAIN 5: CLEANING (6 jobs) ──
    ('DEMO-HIST-025', 'Cleaning', v_cat_clean, v_w_clean, v_wal_clean, 'Complete 2BHK deep home sanitization and mechanized floor scrubbing', 'Gujarat Colony, Kothrud, Pune', 18.5040, 73.8040, 2200.00, 76, 5, 'Sparkling clean bathrooms and kitchen! Worth every rupee.'),
    ('DEMO-HIST-026', 'Cleaning', v_cat_clean, v_w_clean, v_wal_clean, 'Kitchen chimney motorized degreasing and stove tile stain removal', 'Pashan Link Road, Baner, Pune', 18.5550, 73.7870, 950.00, 63, 5, 'Removed stubborn oil grease from exhaust completely.'),
    ('DEMO-HIST-027', 'Cleaning', v_cat_clean, v_w_clean, v_wal_clean, '5-seater fabric sofa deep shampooing and wet vacuum extraction', 'Choudhary Park, Wakad, Pune', 18.5940, 73.7890, 1100.00, 50, 5, 'All coffee and food stains vanished from the sofa.'),
    ('DEMO-HIST-028', 'Cleaning', v_cat_clean, v_w_clean, v_wal_clean, 'Two bathrooms hard water scale removal and anti-bacterial steaming', 'Nagras Road, Aundh, Pune', 18.5585, 73.8065, 850.00, 36, 4, 'Glass shower partitions are crystal clear now.'),
    ('DEMO-HIST-029', 'Cleaning', v_cat_clean, v_w_clean, v_wal_clean, 'Balcony bird netting wash and high pressure water wash', 'Symbiosis Road, Viman Nagar, Pune', 18.5685, 73.9135, 750.00, 22, 5, 'Cleaned and sanitized balcony thoroughly.'),
    ('DEMO-HIST-030', 'Cleaning', v_cat_clean, v_w_clean, v_wal_clean, 'Post renovation dust removal and window track vacuuming', 'Modern Colony, Shivajinagar, Pune', 18.5315, 73.8465, 1850.00, 5, 5, 'Removed fine cement dust from all corners and sliding channels.'),

    -- ── DOMAIN 6: APPLIANCE REPAIR (6 jobs) ──
    ('DEMO-HIST-031', 'Appliance Repair', v_cat_appl, v_w_appl, v_wal_appl, '1.5 Ton Split AC comprehensive wet servicing and pressure gas topup', 'Bhusari Colony, Kothrud, Pune', 18.5055, 73.8025, 1250.00, 73, 5, 'Cooling improved dramatically within 10 minutes of servicing.'),
    ('DEMO-HIST-032', 'Appliance Repair', v_cat_appl, v_w_appl, v_wal_appl, 'Front load washing machine drain pump replacement and drum cleaning', 'Abhimanshree Society, Baner, Pune', 18.5540, 73.7895, 950.00, 60, 5, 'E20 drainage error resolved, machine working silently.'),
    ('DEMO-HIST-033', 'Appliance Repair', v_cat_appl, v_w_appl, v_wal_appl, 'Frost free refrigerator defrost thermostat and timer replacement', 'Thergaon Link Road, Wakad, Pune', 18.5925, 73.7835, 850.00, 46, 4, 'Lower compartment cooling restored perfectly.'),
    ('DEMO-HIST-034', 'Appliance Repair', v_cat_appl, v_w_appl, v_wal_appl, 'Convection microwave high voltage diode and turntable motor replacement', 'Medipoint Road, Aundh, Pune', 18.5575, 73.8045, 750.00, 31, 5, 'Heats food evenly now, replaced original genuine spare parts.'),
    ('DEMO-HIST-035', 'Appliance Repair', v_cat_appl, v_w_appl, v_wal_appl, 'Water purifier 5-stage filter membrane and sediment candle replacement', 'Mhada Colony, Viman Nagar, Pune', 18.5670, 73.9150, 1100.00, 17, 5, 'TDS level checked and calibrated to 90 ppm. Pure taste.'),
    ('DEMO-HIST-036', 'Appliance Repair', v_cat_appl, v_w_appl, v_wal_appl, '25L Storage water geyser heating element and magnesium anode replacement', 'Gokhale Nagar, Shivajinagar, Pune', 18.5330, 73.8410, 850.00, 1, 5, 'Hot water in 5 minutes now. Excellent service.');

    -- Loop through temporary jobs and insert into jobs, payments, wallet_transactions
    FOR v_new_job_id, v_price, v_w_earn, v_coop_share, v_completed_time IN
        SELECT 
            gen_random_uuid(),
            t.price,
            ROUND(t.price * 0.85, 2),
            ROUND(t.price * 0.15, 2),
            NOW() - (t.days_back || ' days')::INTERVAL
        FROM tmp_demo_jobs t
    LOOP
        -- This block is handled in the cursor loop below with complete row context
        NULL;
    END LOOP;

    -- Insert jobs and matching financial records
    DECLARE
        rec RECORD;
        v_job_uuid UUID;
        v_earn NUMERIC;
        v_coop NUMERIC;
        v_t_complete TIMESTAMPTZ;
        v_wal_id UUID;
        v_new_bal NUMERIC;
    BEGIN
        FOR rec IN SELECT * FROM tmp_demo_jobs ORDER BY days_back DESC LOOP
            v_job_uuid := gen_random_uuid();
            v_earn := ROUND(rec.price * 0.85, 2);
            v_coop := ROUND(rec.price * 0.15, 2);
            v_t_complete := NOW() - (rec.days_back || ' days')::INTERVAL;
            v_wal_id := rec.wallet_id;

            -- 1. Insert into public.jobs
            INSERT INTO public.jobs (
                id,
                job_number,
                customer_id,
                customer_name,
                customer_phone,
                customer_location,
                customer_address,
                service_category_id,
                service_category_name,
                description,
                estimated_price,
                actual_price,
                worker_id,
                status,
                payment_status,
                assigned_at,
                accepted_at,
                started_at,
                completed_at,
                rating,
                review,
                review_date,
                worker_earnings,
                cooperative_share,
                is_immediate,
                created_at,
                updated_at
            ) VALUES (
                v_job_uuid,
                rec.job_num,
                v_cust_id,
                v_cust_name,
                v_cust_phone,
                ST_SetSRID(ST_MakePoint(rec.lng, rec.lat), 4326),
                rec.addr,
                rec.cat_id,
                rec.cat_name,
                rec.descr,
                rec.price,
                rec.price,
                rec.worker_id,
                'completed',
                'completed',
                v_t_complete - INTERVAL '40 minutes',
                v_t_complete - INTERVAL '35 minutes',
                v_t_complete - INTERVAL '25 minutes',
                v_t_complete,
                rec.rating,
                rec.review_text,
                v_t_complete,
                v_earn,
                v_coop,
                TRUE,
                v_t_complete - INTERVAL '45 minutes',
                v_t_complete
            );

            -- 2. Insert into public.payments
            INSERT INTO public.payments (
                id,
                job_id,
                customer_id,
                worker_id,
                amount,
                worker_earnings,
                cooperative_share,
                payment_method,
                gateway_payment_id,
                status,
                paid_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                v_job_uuid,
                v_cust_id,
                rec.worker_id,
                rec.price,
                v_earn,
                v_coop,
                'upi',
                'UPI_DEMO_' || substring(md5(rec.job_num), 1, 10),
                'completed',
                v_t_complete,
                v_t_complete,
                v_t_complete
            );

            -- 3. Update worker wallet running balance and record transaction
            IF v_wal_id IS NOT NULL THEN
                UPDATE public.worker_wallets
                SET 
                    balance = ROUND(balance + v_earn, 2),
                    total_earned = ROUND(total_earned + v_earn, 2),
                    updated_at = NOW()
                WHERE id = v_wal_id
                RETURNING balance INTO v_new_bal;

                INSERT INTO public.wallet_transactions (
                    id,
                    wallet_id,
                    transaction_type,
                    amount,
                    balance_after,
                    job_id,
                    description,
                    created_at
                ) VALUES (
                    gen_random_uuid(),
                    v_wal_id,
                    'credit',
                    v_earn,
                    COALESCE(v_new_bal, v_earn),
                    v_job_uuid,
                    'Earning credit for completed job: ' || rec.job_num || ' (' || rec.cat_name || ')',
                    v_t_complete
                );
            END IF;

            -- 4. Increment completed_jobs on workers profile
            IF rec.worker_id IS NOT NULL THEN
                UPDATE public.workers
                SET 
                    completed_jobs = COALESCE(completed_jobs, 0) + 1,
                    total_ratings = COALESCE(total_ratings, 0) + 1,
                    rating = ROUND(COALESCE(rating, 4.8) * 0.9 + rec.rating * 0.1, 2),
                    updated_at = NOW()
                WHERE id = rec.worker_id;
            END IF;

        END LOOP;
    END;

    -- =========================================================================
    -- 5. CALCULATE & ALLOCATE COOPERATIVE SURPLUS DISTRIBUTIONS (15% POOL)
    -- =========================================================================
    -- Total gross revenue across the 36 seeded completed jobs
    SELECT COALESCE(SUM(actual_price), 0) INTO v_tot_rev
    FROM public.jobs
    WHERE job_number LIKE 'DEMO-HIST-%' AND status = 'completed';

    v_coop_pool := ROUND(v_tot_rev * 0.15, 2);

    -- Loop through each worker who completed work in this batch
    FOR v_dist_w_id, v_w_work IN
        SELECT worker_id, SUM(actual_price)
        FROM public.jobs
        WHERE job_number LIKE 'DEMO-HIST-%' AND status = 'completed' AND worker_id IS NOT NULL
        GROUP BY worker_id
    LOOP
        v_w_share_pct := ROUND((v_w_work / NULLIF(v_tot_rev, 0)) * 100, 2);
        v_w_dist := ROUND(v_coop_pool * (v_w_share_pct / 100), 2);

        -- Insert cooperative distribution record (Idempotent)
        INSERT INTO public.cooperative_distributions (
            id,
            worker_id,
            distribution_period,
            eligible_work_amount,
            work_share_percentage,
            cooperative_pool_amount,
            distribution_amount,
            created_at
        ) VALUES (
            gen_random_uuid(),
            v_dist_w_id,
            'demo-historical-2026-09',
            v_w_work,
            v_w_share_pct,
            v_coop_pool,
            v_w_dist,
            NOW()
        )
        ON CONFLICT (worker_id, distribution_period) DO NOTHING;

        -- Resolve worker wallet and record distribution credit
        SELECT id, balance INTO v_dist_wal_id, v_cur_bal
        FROM public.worker_wallets
        WHERE worker_id = v_dist_w_id
        LIMIT 1;

        IF v_dist_wal_id IS NOT NULL THEN
            UPDATE public.worker_wallets
            SET
                balance = balance + v_w_dist,
                total_earned = total_earned + v_w_dist,
                updated_at = NOW()
            WHERE id = v_dist_wal_id;

            INSERT INTO public.wallet_transactions (
                id,
                wallet_id,
                transaction_type,
                amount,
                balance_after,
                job_id,
                description,
                created_at
            ) VALUES (
                gen_random_uuid(),
                v_dist_wal_id,
                'cooperative_distribution',
                v_w_dist,
                COALESCE(v_cur_bal, 0) + v_w_dist,
                NULL,
                'Shram Sangam cooperative surplus distribution (15% pool) for demo-historical-2026-09',
                NOW()
            );
        END IF;
    END LOOP;

    RAISE NOTICE '✅ Successfully seeded 36 completed historical jobs and allocated ₹% cooperative surplus pool back to workers.', v_coop_pool;
END $$;

COMMIT;

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- 1. Status Summary
SELECT status, COUNT(*) AS count
FROM public.jobs
GROUP BY status
ORDER BY status;

-- 2. Financial Totals & 15% Cooperative Surplus Split Verification
SELECT
  COUNT(*) AS completed_jobs,
  COALESCE(SUM(actual_price), 0) AS completed_revenue,
  COALESCE(SUM(worker_earnings), 0) AS direct_worker_earnings_85pct,
  COALESCE(SUM(cooperative_share), 0) AS cooperative_surplus_pool_15pct,
  ROUND(COALESCE(SUM(cooperative_share), 0) / NULLIF(SUM(actual_price), 0) * 100, 2) AS surplus_percentage
FROM public.jobs
WHERE status = 'completed';

-- 3. Cooperative Surplus Distributions Summary
SELECT
  cd.distribution_period,
  COUNT(cd.id) AS eligible_workers_count,
  SUM(cd.eligible_work_amount) AS total_eligible_work,
  SUM(cd.work_share_percentage) AS total_work_share_pct,
  MAX(cd.cooperative_pool_amount) AS total_surplus_pool,
  SUM(cd.distribution_amount) AS total_distributed_to_workers
FROM public.cooperative_distributions cd
GROUP BY cd.distribution_period;

-- 4. Worker Individual Work Share & Cooperative Distribution
SELECT
  w.id AS worker_id,
  cd.distribution_period,
  cd.eligible_work_amount,
  cd.work_share_percentage,
  cd.distribution_amount AS cooperative_share_received,
  ww.balance AS current_wallet_balance
FROM public.cooperative_distributions cd
JOIN public.workers w ON w.id = cd.worker_id
LEFT JOIN public.worker_wallets ww ON ww.worker_id = w.id
ORDER BY cd.distribution_amount DESC;

-- 5. Payments Verification
SELECT
  status,
  COUNT(*) AS payment_count,
  COALESCE(SUM(amount), 0) AS total_paid,
  COALESCE(SUM(worker_earnings), 0) AS direct_worker_share,
  COALESCE(SUM(cooperative_share), 0) AS cooperative_pool_share
FROM public.payments
GROUP BY status;

