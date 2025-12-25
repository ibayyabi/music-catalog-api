-- Add indexes to existing table for optimal performance
-- Run this only if your existing table doesn't have these indexes

-- Check existing indexes first:
-- SHOW INDEX FROM tracks;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_track_genre ON tracks(track_genre);
CREATE INDEX IF NOT EXISTS idx_track_name ON tracks(track_name);

-- Optional: Add index for energy-based queries (recommendations)
CREATE INDEX IF NOT EXISTS idx_energy ON tracks(energy);
CREATE INDEX IF NOT EXISTS idx_valence ON tracks(valence);

-- Verify indexes were created
SHOW INDEX FROM tracks;
