-- Reference Schema for Music Catalog
-- This is for documentation purposes only
-- Adjust field names and types to match your existing database

CREATE TABLE IF NOT EXISTS tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  track_id VARCHAR(255) NOT NULL UNIQUE,
  track_name VARCHAR(500) NOT NULL,
  artists VARCHAR(500),
  album_name VARCHAR(500),
  track_genre VARCHAR(100),
  energy DECIMAL(3,2),
  valence DECIMAL(3,2),
  acousticness DECIMAL(3,2),
  tempo DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_track_id (track_id),
  INDEX idx_track_genre (track_genre),
  INDEX idx_track_name (track_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expected columns for the API:
-- - track_id: Unique identifier for the track
-- - track_name: Name of the track
-- - artists: Artist name(s)
-- - album_name: Album name
-- - track_genre: Genre of the track
-- - energy: Energy level (0.0 to 1.0)
-- - valence: Happiness/positivity (0.0 to 1.0)
-- - acousticness: Acoustic quality (0.0 to 1.0)
-- - tempo: Beats per minute
