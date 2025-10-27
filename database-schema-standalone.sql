-- Skateboard.bio Database Schema (Standalone Version)
-- This schema creates all necessary tables for skateboard.bio in a fresh database

-- Enable UUID extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Skaters table - Core skateboarder profiles
CREATE TABLE IF NOT EXISTS skaters (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,  -- URL-friendly identifier (e.g., 'tonyhawk', 'rodneymullen')
  full_name TEXT NOT NULL,
  nickname TEXT,
  bio TEXT,
  birth_date DATE,
  birthplace TEXT,
  hometown TEXT,
  stance TEXT CHECK (stance IN ('regular', 'goofy', 'switch')),
  turned_pro_year INTEGER,
  sponsors TEXT[], -- Array of sponsor names
  social_links JSONB, -- { "instagram": "url", "twitter": "url", etc }
  profile_image_url TEXT,
  header_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media Assets table - Photos and videos for each skater
CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  skater_id VARCHAR NOT NULL REFERENCES skaters(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'gif')),
  url TEXT NOT NULL, -- CDN URL (e.g., cdn.skateboard.bio/tonyhawk/trick1.mp4)
  title TEXT,
  description TEXT,
  caption TEXT,
  thumbnail_url TEXT, -- For videos
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For videos, in seconds
  file_size BIGINT, -- In bytes
  sort_order INTEGER, -- Manual ordering
  tags TEXT[], -- For categorization
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timeline table - Career milestones and events
CREATE TABLE IF NOT EXISTS timeline (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  skater_id VARCHAR NOT NULL REFERENCES skaters(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_year INTEGER NOT NULL, -- Denormalized for easier querying
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('contest', 'sponsorship', 'video_part', 'injury', 'achievement', 'other')),
  location TEXT,
  media_url TEXT, -- Optional image/video for this event
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parts table - Video parts (e.g., skate videos they appeared in)
CREATE TABLE IF NOT EXISTS parts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  skater_id VARCHAR NOT NULL REFERENCES skaters(id) ON DELETE CASCADE,
  video_name TEXT NOT NULL, -- e.g., "The Berrics - Battle Commander"
  video_company TEXT, -- e.g., "The Berrics", "Thrasher"
  release_year INTEGER,
  release_date DATE,
  part_title TEXT, -- Specific part name if applicable
  video_url TEXT, -- YouTube/Vimeo embed or direct link
  thumbnail_url TEXT,
  duration INTEGER, -- In seconds
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contests table - Contest results and placements
CREATE TABLE IF NOT EXISTS contests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  skater_id VARCHAR NOT NULL REFERENCES skaters(id) ON DELETE CASCADE,
  contest_name TEXT NOT NULL, -- e.g., "X Games", "Street League"
  contest_series TEXT, -- e.g., "X Games", "Dew Tour"
  event_type TEXT, -- e.g., "Street", "Vert", "Big Air"
  contest_date DATE,
  contest_year INTEGER, -- Denormalized for easier querying
  location TEXT,
  placement INTEGER, -- 1st, 2nd, 3rd, etc.
  placement_text TEXT, -- "1st Place", "Gold Medal"
  prize_money NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  media_url TEXT, -- Photo/video from the contest
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Domains table - Maps individual .bio domains to skater profiles
CREATE TABLE IF NOT EXISTS domains (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT UNIQUE NOT NULL, -- e.g., "tonyhawk.bio"
  skater_id VARCHAR REFERENCES skaters(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_skaters_slug ON skaters(slug);
CREATE INDEX IF NOT EXISTS idx_media_assets_skater_id ON media_assets(skater_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);
CREATE INDEX IF NOT EXISTS idx_timeline_skater_id ON timeline(skater_id);
CREATE INDEX IF NOT EXISTS idx_timeline_year ON timeline(event_year);
CREATE INDEX IF NOT EXISTS idx_parts_skater_id ON parts(skater_id);
CREATE INDEX IF NOT EXISTS idx_parts_year ON parts(release_year);
CREATE INDEX IF NOT EXISTS idx_contests_skater_id ON contests(skater_id);
CREATE INDEX IF NOT EXISTS idx_contests_year ON contests(contest_year);
CREATE INDEX IF NOT EXISTS idx_domains_skater_id ON domains(skater_id);
CREATE INDEX IF NOT EXISTS idx_domains_host ON domains(host);
