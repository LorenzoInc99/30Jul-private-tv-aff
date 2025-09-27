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

async function syncPremierLeague() {
  console.log('🚀 Syncing Premier League teams...');
  
  try {
    let apiCalls = 0;
    let teamsStored = 0;
    
    // 1. Sync Premier League (ID: 501)
    console.log('📊 Fetching Premier League teams...');
    apiCalls++;
    
    const teamsResponse = await fetch(`https://api.sportmonks.com/v3/football/leagues/501/teams?api_token=${SPORTMONKS_API_TOKEN}`);
    
    if (!teamsResponse.ok) {
      console.log(`❌ Error fetching Premier League teams: HTTP ${teamsResponse.status}`);
      const errorText = await teamsResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data || [];
    
    console.log(`📊 Found ${teams.length} Premier League teams`);
    
    if (teams.length === 0) {
      console.log('❌ No teams found for Premier League');
      return;
    }
    
    // Show sample teams
    console.log('📊 Sample Premier League teams:');
    teams.slice(0, 10).forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`);
    });
    
    // Check if Tottenham is in the list
    const tottenham = teams.find(team => 
      team.name.toLowerCase().includes('tottenham') ||
      team.name.toLowerCase().includes('spurs')
    );
    
    if (tottenham) {
      console.log(`✅ Found Tottenham: "${tottenham.name}" (ID: ${tottenham.id})`);
    } else {
      console.log(`❌ Tottenham not found in Premier League teams`);
    }
    
    // Store teams in database
    console.log('💾 Storing teams in database...');
    
    const teamsToUpsert = teams.map(team => ({
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
    
    teamsStored = teams.length;
    console.log(`✅ Successfully stored ${teamsStored} Premier League teams`);
    
    // 2. Also sync the league itself
    console.log('📊 Fetching Premier League details...');
    apiCalls++;
    
    const leagueResponse = await fetch(`https://api.sportmonks.com/v3/football/leagues/501?api_token=${SPORTMONKS_API_TOKEN}`);
    
    if (!leagueResponse.ok) {
      console.log(`❌ Error fetching Premier League: HTTP ${leagueResponse.status}`);
    } else {
      const leagueData = await leagueResponse.json();
      const league = leagueData.data;
      
      if (league) {
        console.log(`📊 Premier League: "${league.name}" (ID: ${league.id})`);
        
        // Store league in database
        const { error: leagueUpsertError } = await supabase
          .from('leagues')
          .upsert({
            id: league.id,
            name: league.name,
            sport_id: league.sport_id,
            country_id: league.country_id,
            league_logo: league.image_path
          }, { onConflict: 'id' });
        
        if (leagueUpsertError) {
          console.log(`❌ Error storing league: ${leagueUpsertError.message}`);
        } else {
          console.log(`✅ Successfully stored Premier League`);
        }
      }
    }
    
    console.log(`🎉 Sync completed!`);
    console.log(`📊 API calls used: ${apiCalls}`);
    console.log(`📊 Teams stored: ${teamsStored}`);
    
    // Test Tottenham link
    if (tottenham) {
      const { createClient } = require('@supabase/supabase-js');
      const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      const tottenhamSlug = slugify(tottenham.name);
      console.log(`\n🎯 Tottenham should now be accessible at: /team/${tottenhamSlug}`);
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncPremierLeague();




