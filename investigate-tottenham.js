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

async function investigateTottenham() {
  console.log('🔍 Investigating Tottenham in database...');
  
  try {
    // 1. Check if Tottenham exists in teams_new
    const { data: tottenhamTeams, error: tottenhamError } = await supabase
      .from('teams_new')
      .select('*')
      .or('name.ilike.%tottenham%,name.ilike.%spurs%');
    
    if (tottenhamError) {
      console.log(`❌ Error fetching Tottenham teams: ${tottenhamError.message}`);
    } else {
      console.log(`📊 Tottenham teams in teams_new: ${tottenhamTeams?.length || 0}`);
      if (tottenhamTeams && tottenhamTeams.length > 0) {
        tottenhamTeams.forEach(team => {
          console.log(`  - "${team.name}" (ID: ${team.id})`);
        });
      }
    }
    
    // 2. Check if Tottenham appears in any fixtures
    const { data: tottenhamFixtures, error: tottenhamFixturesError } = await supabase
      .from('fixtures')
      .select(`
        id, name, starting_at,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name)
      `)
      .or('home_team.name.ilike.%tottenham%,away_team.name.ilike.%tottenham%,home_team.name.ilike.%spurs%,away_team.name.ilike.%spurs%');
    
    if (tottenhamFixturesError) {
      console.log(`❌ Error fetching Tottenham fixtures: ${tottenhamFixturesError.message}`);
    } else {
      console.log(`📊 Tottenham fixtures: ${tottenhamFixtures?.length || 0}`);
      if (tottenhamFixtures && tottenhamFixtures.length > 0) {
        tottenhamFixtures.forEach(fixture => {
          console.log(`  - ${fixture.home_team?.name || 'Unknown'} vs ${fixture.away_team?.name || 'Unknown'} (${fixture.starting_at})`);
        });
      }
    }
    
    // 3. Check what teams are actually showing on the homepage
    console.log('\n📊 Checking what teams are in current fixtures...');
    
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    
    const { data: todayFixtures, error: todayError } = await supabase
      .from('fixtures')
      .select(`
        id, name, starting_at,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name)
      `)
      .gte('starting_at', todayDate)
      .lt('starting_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('starting_at', { ascending: true });
    
    if (todayError) {
      console.log(`❌ Error fetching today's fixtures: ${todayError.message}`);
    } else {
      console.log(`📊 Today's fixtures: ${todayFixtures?.length || 0}`);
      if (todayFixtures && todayFixtures.length > 0) {
        console.log('📊 Teams showing on homepage today:');
        todayFixtures.forEach(fixture => {
          console.log(`  - ${fixture.home_team?.name || 'Unknown'} vs ${fixture.away_team?.name || 'Unknown'}`);
        });
      }
    }
    
    // 4. Check if there are any teams with similar names
    const { data: similarTeams, error: similarError } = await supabase
      .from('teams_new')
      .select('*')
      .or('name.ilike.%hotspur%,name.ilike.%london%')
      .limit(10);
    
    if (similarError) {
      console.log(`❌ Error fetching similar teams: ${similarError.message}`);
    } else {
      console.log(`📊 Teams with similar names: ${similarTeams?.length || 0}`);
      if (similarTeams && similarTeams.length > 0) {
        similarTeams.forEach(team => {
          console.log(`  - "${team.name}" (ID: ${team.id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    process.exit(1);
  }
}

investigateTottenham();
















