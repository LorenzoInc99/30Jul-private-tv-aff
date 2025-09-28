# 🗄️ Database Migration Instructions

## Step 1: Run the SQL Migration

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste this SQL:**

```sql
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
```

4. **Click "Run" to execute**

## Step 2: Test the Migration

After running the migration, test it by visiting:
```
http://localhost:3001/api/test-league-tracking
```

You should see a success message with the initial league priorities.

## Step 3: Test the Tracking

1. **Visit your home page**: `http://localhost:3001`
2. **Click on different leagues** (Premier League, La Liga, etc.)
3. **Click on matches** within those leagues
4. **Check the tracking** by visiting the test endpoint again

## Step 4: Verify Personalized Ordering

The leagues should now be ordered based on your interactions:
- **Most clicked leagues** appear first
- **Least clicked leagues** appear last
- **System learns** from your behavior over time

## 🎯 Expected Results

After the migration, you should see:
- ✅ Tables created successfully
- ✅ Initial priorities set for major leagues
- ✅ Tracking system working
- ✅ Personalized league ordering

## 🚨 Troubleshooting

If you get errors:
1. **Check Supabase connection** in your dashboard
2. **Verify table names** match your schema
3. **Check foreign key references** (leagues table)
4. **Run migration again** if needed

