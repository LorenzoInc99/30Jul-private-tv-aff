-- Fix permissions for league tracking tables
-- Run this in your Supabase SQL Editor

-- Grant permissions to authenticated users
GRANT ALL ON league_interactions TO authenticated;
GRANT ALL ON league_priorities TO authenticated;

-- Grant permissions to anon users (for anonymous tracking)
GRANT ALL ON league_interactions TO anon;
GRANT ALL ON league_priorities TO anon;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE league_interactions_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE league_interactions_id_seq TO anon;

-- Enable RLS (Row Level Security) if needed
ALTER TABLE league_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_priorities ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous access to league_interactions" ON league_interactions
  FOR ALL TO anon USING (true);

CREATE POLICY "Allow anonymous access to league_priorities" ON league_priorities
  FOR ALL TO anon USING (true);

-- Create policies for authenticated access
CREATE POLICY "Allow authenticated access to league_interactions" ON league_interactions
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated access to league_priorities" ON league_priorities
  FOR ALL TO authenticated USING (true);
