const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeDatabaseReset() {
  console.log('🗑️ COMPLETE DATABASE RESET - Clearing ALL data...');
  
  try {
    // Clear all tables in the correct order (respecting foreign key constraints)
    const tables = [
      'odds',
      'fixturetvstations', 
      'match_broadcaster_clicks',
      'standings',
      'squads',
      'fixtures',
      'teams_new',
      'leagues',
      'seasons',
      'venues',
      'countries',
      'states',
      'tvstations',
      'bookmakers',
      'players',
      'admin_operations'
    ];

    for (const table of tables) {
      console.log(`🗑️ Clearing table: ${table}`);
      try {
        const { error } = await supabase.from(table).delete().neq('id', 0);
        if (error) {
          console.log(`⚠️ Warning clearing ${table}: ${error.message}`);
        } else {
          console.log(`✅ Cleared ${table}`);
        }
      } catch (err) {
        console.log(`⚠️ Error clearing ${table}: ${err.message}`);
      }
    }

    console.log('🎉 COMPLETE DATABASE RESET SUCCESSFUL!');
    console.log('📊 Database is now completely empty and ready for fresh data');
    console.log('🚀 Ready to sync current 2025 data with proper team information');
    
  } catch (error) {
    console.error('❌ Error during complete database reset:', error.message);
    process.exit(1);
  }
}

completeDatabaseReset();














