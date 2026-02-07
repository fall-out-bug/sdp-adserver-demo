-- Migration: Create clicks table
CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    impression_id UUID NOT NULL REFERENCES impressions(id) ON DELETE SET NULL,
    banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip VARCHAR(45) NOT NULL,
    referer TEXT,
    country VARCHAR(2)
);

CREATE INDEX IF NOT EXISTS idx_clicks_impression_id ON clicks(impression_id);
CREATE INDEX IF NOT EXISTS idx_clicks_banner_id ON clicks(banner_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON clicks(timestamp);
