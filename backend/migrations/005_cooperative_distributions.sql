-- ============================================================================
-- SHRAM SANGAM / SAHAKAR - COOPERATIVE SURPLUS DISTRIBUTIONS
-- Migration: 005_cooperative_distributions.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cooperative_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    distribution_period VARCHAR(50) NOT NULL, -- e.g. '2026-09', '2026-Q3', 'demo-historical-2026-09'
    eligible_work_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    work_share_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    cooperative_pool_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    distribution_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_worker_distribution_period UNIQUE (worker_id, distribution_period)
);

-- Index for fast lookup by worker and period
CREATE INDEX IF NOT EXISTS idx_coop_dist_worker_id ON public.cooperative_distributions(worker_id);
CREATE INDEX IF NOT EXISTS idx_coop_dist_period ON public.cooperative_distributions(distribution_period);
