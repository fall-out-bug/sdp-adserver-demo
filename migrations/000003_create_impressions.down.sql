-- Rollback: Drop impressions table
DROP INDEX IF EXISTS idx_impressions_campaign_id;
DROP INDEX IF NOT EXISTS idx_impressions_banner_id;
DROP INDEX IF EXISTS idx_impressions_slot_id;
DROP INDEX IF EXISTS idx_impressions_timestamp;
DROP TABLE IF EXISTS impressions;
