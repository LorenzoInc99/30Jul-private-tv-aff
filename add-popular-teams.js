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
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPopularTeams() {
  console.log('🚀 Adding popular teams to database...');
  
  try {
    // Popular teams that users might click on
    const popularTeams = [
      { id: 1001, name: 'Tottenham Hotspur', short_code: 'TOT', country_id: 42, venue_id: null, team_logo_url: null },
      { id: 1002, name: 'Arsenal', short_code: 'ARS', country_id: 42, venue_id: null, team_logo_url: null },
      { id: 1003, name: 'Chelsea', short_code: 'CHE', country_id: 42, venue_id: null, team_logo_url: null },
      { id: 1004, name: 'Manchester United', short_code: 'MUN', country_id: 42, venue_id: null, team_logo_url: null },
      { id: 1005, name: 'Manchester City', short_code: 'MCI', country_id: 42, venue_id: null, team_logo_url: null },
      { id: 1006, name: 'Liverpool', short_code: 'LIV', country_id: 42, venue_id: null, team_logo_url: null },
      { id: 1007, name: 'Real Madrid', short_code: 'RMA', country_id: 60, venue_id: null, team_logo_url: null },
      { id: 1008, name: 'Barcelona', short_code: 'BAR', country_id: 60, venue_id: null, team_logo_url: null },
      { id: 1009, name: 'Atletico Madrid', short_code: 'ATM', country_id: 60, venue_id: null, team_logo_url: null },
      { id: 1010, name: 'Bayern Munich', short_code: 'BAY', country_id: 48, venue_id: null, team_logo_url: null },
      { id: 1011, name: 'Borussia Dortmund', short_code: 'BVB', country_id: 48, venue_id: null, team_logo_url: null },
      { id: 1012, name: 'Paris Saint-Germain', short_code: 'PSG', country_id: 61, venue_id: null, team_logo_url: null },
      { id: 1013, name: 'Juventus', short_code: 'JUV', country_id: 49, venue_id: null, team_logo_url: null },
      { id: 1014, name: 'AC Milan', short_code: 'MIL', country_id: 49, venue_id: null, team_logo_url: null },
      { id: 1015, name: 'Inter Milan', short_code: 'INT', country_id: 49, venue_id: null, team_logo_url: null }
    ];
    
    console.log(`📊 Adding ${popularTeams.length} popular teams...`);
    
    // Store teams in database
    const { error: upsertError } = await supabase
      .from('teams_new')
      .upsert(popularTeams, { onConflict: 'id' });
    
    if (upsertError) {
      console.log(`❌ Error storing teams: ${upsertError.message}`);
      return;
    }
    
    console.log(`✅ Successfully added ${popularTeams.length} popular teams`);
    
    // Test Tottenham link
    const tottenham = popularTeams.find(team => team.name === 'Tottenham Hotspur');
    if (tottenham) {
      const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      const tottenhamSlug = slugify(tottenham.name);
      console.log(`\n🎯 Tottenham should now be accessible at: /team/${tottenhamSlug}`);
    }
    
    // Show all added teams and their slugs
    console.log('\n📊 Added teams and their URLs:');
    popularTeams.forEach(team => {
      const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      const slug = slugify(team.name);
      console.log(`  - ${team.name} → /team/${slug}`);
    });
    
    console.log(`\n🎉 Popular teams added successfully!`);
    console.log(`📊 Teams added: ${popularTeams.length}`);
    
  } catch (error) {
    console.error('❌ Add failed:', error.message);
    process.exit(1);
  }
}

addPopularTeams();


