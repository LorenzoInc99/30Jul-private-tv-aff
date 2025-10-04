-- Add league tracking tables to your existing database
-- Run this in your Supabase SQL editor

-- Create league interactions table
CREATE TABLE IF NOT EXISTS league_interactions (
  id SERIAL PRIMARY KEY,
  league_id INTEGER REFERENCES leagues(id),
  session_id VARCHAR(255),
  action VARCHAR(50),
  value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_league_interactions_league_id ON league_interactions(league_id);
CREATE INDEX IF NOT EXISTS idx_league_interactions_session_id ON league_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_league_interactions_created_at ON league_interactions(created_at);

-- Create league priorities table
CREATE TABLE IF NOT EXISTS league_priorities (
  league_id INTEGER PRIMARY KEY REFERENCES leagues(id),
  priority INTEGER DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial priorities for major leagues
INSERT INTO league_priorities (league_id, priority) VALUES 
  (8, 1),   -- Premier League
  (564, 2), -- La Liga  
  (384, 3), -- Serie A
  (82, 4),  -- Bundesliga
  (301, 5), -- Ligue 1
  (9, 11),  -- Championship
  (72, 12), -- Eredivisie
  (462, 13) -- Liga Portugal
ON CONFLICT (league_id) DO NOTHING;











