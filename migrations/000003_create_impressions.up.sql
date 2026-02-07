-- Migration: Create impressions table
CREATE TABLE IF NOT EXISTS impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE SET NULL,
    slot_id VARCHAR(255) NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    referer TEXT,
    country VARCHAR(2),
    device VARCHAR(50),
    fraud_score DECIMAL(5, 2) DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_impressions_timestamp ON impressions(timestamp);
CREATE INDEX IF NOT EXISTS idx_impressions_slot_id ON impressions(slot_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_impressions_banner_id ON impressions(banner_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_impressions_campaign_id ON impressions(campaign_id, timestamp);
