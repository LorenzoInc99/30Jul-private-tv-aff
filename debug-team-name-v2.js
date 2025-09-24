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

// Slugify function (same as in utils.ts)
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
    .replace(/\-\-+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start of text
    .replace(/-+$/, '');           // Trim - from end of text
}

async function debugTeamNameV2() {
  console.log('🔍 Debugging team name in fixtures (v2)...');
  
  try {
    // Get all fixtures and find Tottenham manually
    const { data: allFixtures, error: allFixturesError } = await supabase
      .from('fixtures')
      .select(`
        id, name, starting_at,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name)
      `)
      .limit(100);
    
    if (allFixturesError) {
      console.log(`❌ Error fetching fixtures: ${allFixturesError.message}`);
      return;
    }
    
    if (!allFixtures || allFixtures.length === 0) {
      console.log('❌ No fixtures found');
      return;
    }
    
    // Find Tottenham fixture manually
    const tottenhamFixture = allFixtures.find(fixture => 
      fixture.home_team?.name?.toLowerCase().includes('tottenham') ||
      fixture.away_team?.name?.toLowerCase().includes('tottenham')
    );
    
    if (!tottenhamFixture) {
      console.log('❌ Tottenham fixture not found');
      return;
    }
    
    console.log(`✅ Found Tottenham fixture: ${tottenhamFixture.home_team?.name || 'Unknown'} vs ${tottenhamFixture.away_team?.name || 'Unknown'}`);
    
    // Check the exact team name
    const tottenhamTeam = tottenhamFixture.home_team?.name || tottenhamFixture.away_team?.name;
    if (tottenhamTeam) {
      console.log(`📊 Tottenham team name: "${tottenhamTeam}"`);
      console.log(`📊 Generated slug: "${slugify(tottenhamTeam)}"`);
      console.log(`📊 Expected URL: /team/${slugify(tottenhamTeam)}`);
    }
    
    // Check if there's a difference in the team name
    console.log('\n🔍 Checking for name variations...');
    
    const { data: tottenhamTeams, error: tottenhamTeamsError } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', '%tottenham%');
    
    if (tottenhamTeamsError) {
      console.log(`❌ Error fetching Tottenham teams: ${tottenhamTeamsError.message}`);
    } else {
      console.log(`📊 All Tottenham teams in database:`);
      tottenhamTeams.forEach(team => {
        const slug = slugify(team.name);
        console.log(`  - "${team.name}" → "${slug}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugTeamNameV2();


