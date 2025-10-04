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

async function debugTeamIssues() {
  console.log('🔍 Debugging team page issues...');
  
  try {
    // Check for duplicate teams
    const { data: tottenhamTeams, error: tottenhamError } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', '%tottenham%');
    
    if (tottenhamError) {
      console.log(`❌ Error fetching Tottenham teams: ${tottenhamError.message}`);
    } else {
      console.log(`📊 Tottenham teams found: ${tottenhamTeams?.length || 0}`);
      if (tottenhamTeams && tottenhamTeams.length > 0) {
        tottenhamTeams.forEach(team => {
          console.log(`  - ID: ${team.id}, Name: "${team.name}", Country: ${team.country_id}`);
        });
      }
    }
    
    // Check for Newcastle teams
    const { data: newcastleTeams, error: newcastleError } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', '%newcastle%');
    
    if (newcastleError) {
      console.log(`❌ Error fetching Newcastle teams: ${newcastleError.message}`);
    } else {
      console.log(`📊 Newcastle teams found: ${newcastleTeams?.length || 0}`);
      if (newcastleTeams && newcastleTeams.length > 0) {
        newcastleTeams.forEach(team => {
          console.log(`  - ID: ${team.id}, Name: "${team.name}", Country: ${team.country_id}`);
        });
      }
    }
    
    // Check for fake teams (IDs 1001-1015)
    const { data: fakeTeams, error: fakeError } = await supabase
      .from('teams_new')
      .select('*')
      .gte('id', 1001)
      .lte('id', 1015);
    
    if (fakeError) {
      console.log(`❌ Error fetching fake teams: ${fakeError.message}`);
    } else {
      console.log(`📊 Fake teams found: ${fakeTeams?.length || 0}`);
      if (fakeTeams && fakeTeams.length > 0) {
        console.log('❌ These are the fake teams I created:');
        fakeTeams.forEach(team => {
          console.log(`  - ID: ${team.id}, Name: "${team.name}"`);
        });
      }
    }
    
    // Check if there are any fixtures with fake team IDs
    const { data: fakeFixtures, error: fakeFixturesError } = await supabase
      .from('fixtures')
      .select('id, name, home_team_id, away_team_id')
      .or('home_team_id.gte.1001,away_team_id.gte.1001')
      .limit(10);
    
    if (fakeFixturesError) {
      console.log(`❌ Error fetching fake fixtures: ${fakeFixturesError.message}`);
    } else {
      console.log(`📊 Fixtures with fake team IDs: ${fakeFixtures?.length || 0}`);
      if (fakeFixtures && fakeFixtures.length > 0) {
        console.log('❌ These fixtures reference fake teams:');
        fakeFixtures.forEach(fixture => {
          console.log(`  - ${fixture.name} (Home: ${fixture.home_team_id}, Away: ${fixture.away_team_id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugTeamIssues();
















