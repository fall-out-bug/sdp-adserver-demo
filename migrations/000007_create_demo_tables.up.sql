-- +migrate Up
-- Demo banners table for demo website
CREATE TABLE IF NOT EXISTS demo_banners (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  format VARCHAR(50) NOT NULL,
  html TEXT,
  image_url TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  click_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on format for faster queries
CREATE INDEX IF NOT EXISTS idx_demo_banners_format ON demo_banners(format);
CREATE INDEX IF NOT EXISTS idx_demo_banners_active ON demo_banners(active);

-- Demo slots table for demo website
CREATE TABLE IF NOT EXISTS demo_slots (
  id UUID PRIMARY KEY,
  slot_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  format VARCHAR(50) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  demo_banner_id UUID REFERENCES demo_banners(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for slots
CREATE INDEX IF NOT EXISTS idx_demo_slots_slot_id ON demo_slots(slot_id);
CREATE INDEX IF NOT EXISTS idx_demo_slots_format ON demo_slots(format);
