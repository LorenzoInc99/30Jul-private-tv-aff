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
const SPORTMONKS_API_TOKEN = envVars.SPORTMONKS_API_TOKEN;

if (!supabaseUrl || !supabaseKey || !SPORTMONKS_API_TOKEN) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncPremierLeagueV2() {
  console.log('🚀 Syncing Premier League teams (v2)...');
  
  try {
    let apiCalls = 0;
    let teamsStored = 0;
    
    // 1. First, let's get all teams and filter for Premier League
    console.log('📊 Fetching all teams...');
    apiCalls++;
    
    const teamsResponse = await fetch(`https://api.sportmonks.com/v3/football/teams?api_token=${SPORTMONKS_API_TOKEN}&per_page=100`);
    
    if (!teamsResponse.ok) {
      console.log(`❌ Error fetching teams: HTTP ${teamsResponse.status}`);
      const errorText = await teamsResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const teamsData = await teamsResponse.json();
    const allTeams = teamsData.data || [];
    
    console.log(`📊 Found ${allTeams.length} teams total`);
    
    // Look for Premier League teams (English teams)
    const premierLeagueTeams = allTeams.filter(team => 
      team.country_id === 42 || // England
      team.name.toLowerCase().includes('tottenham') ||
      team.name.toLowerCase().includes('spurs') ||
      team.name.toLowerCase().includes('arsenal') ||
      team.name.toLowerCase().includes('chelsea') ||
      team.name.toLowerCase().includes('manchester') ||
      team.name.toLowerCase().includes('liverpool') ||
      team.name.toLowerCase().includes('city') ||
      team.name.toLowerCase().includes('united')
    );
    
    console.log(`📊 Premier League teams found: ${premierLeagueTeams.length}`);
    
    if (premierLeagueTeams.length === 0) {
      console.log('❌ No Premier League teams found');
      return;
    }
    
    // Show sample teams
    console.log('📊 Sample Premier League teams:');
    premierLeagueTeams.slice(0, 10).forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id}) - Country: ${team.country_id}`);
    });
    
    // Check if Tottenham is in the list
    const tottenham = premierLeagueTeams.find(team => 
      team.name.toLowerCase().includes('tottenham') ||
      team.name.toLowerCase().includes('spurs')
    );
    
    if (tottenham) {
      console.log(`✅ Found Tottenham: "${tottenham.name}" (ID: ${tottenham.id})`);
    } else {
      console.log(`❌ Tottenham not found in teams`);
    }
    
    // Store teams in database
    console.log('💾 Storing Premier League teams in database...');
    
    const teamsToUpsert = premierLeagueTeams.map(team => ({
      id: team.id,
      name: team.name,
      short_code: team.short_code,
      country_id: team.country_id,
      venue_id: team.venue_id,
      team_logo_url: team.image_path
    }));
    
    const { error: upsertError } = await supabase
      .from('teams_new')
      .upsert(teamsToUpsert, { onConflict: 'id' });
    
    if (upsertError) {
      console.log(`❌ Error storing teams: ${upsertError.message}`);
      return;
    }
    
    teamsStored = premierLeagueTeams.length;
    console.log(`✅ Successfully stored ${teamsStored} Premier League teams`);
    
    // Test Tottenham link
    if (tottenham) {
      const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      const tottenhamSlug = slugify(tottenham.name);
      console.log(`\n🎯 Tottenham should now be accessible at: /team/${tottenhamSlug}`);
    }
    
    console.log(`🎉 Sync completed!`);
    console.log(`📊 API calls used: ${apiCalls}`);
    console.log(`📊 Teams stored: ${teamsStored}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncPremierLeagueV2();

















