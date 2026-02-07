-- Rollback: Drop banners table
DROP INDEX IF EXISTS idx_banners_size;
DROP INDEX IF EXISTS idx_banners_status;
DROP INDEX IF EXISTS idx_banners_campaign;
DROP TABLE IF EXISTS banners;
