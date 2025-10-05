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

async function debugOddsTomorrow() {
  console.log('🔍 Debugging odds for tomorrow...');
  
  try {
    // Get tomorrow's fixtures
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    console.log(`📅 Looking for fixtures on: ${tomorrowDate}`);
    
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        id, 
        name, 
        starting_at,
        home_team_id,
        away_team_id,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name)
      `)
      .gte('starting_at', tomorrowDate)
      .lt('starting_at', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('starting_at', { ascending: true });
    
    if (fixturesError) {
      throw new Error(`Database error: ${fixturesError.message}`);
    }
    
    if (!fixtures || fixtures.length === 0) {
      console.log('✅ No fixtures found for tomorrow');
      return;
    }
    
    console.log(`📊 Found ${fixtures.length} fixtures for tomorrow`);
    
    // Test with the first fixture
    const testFixture = fixtures[0];
    console.log(`🎯 Testing odds for: ${testFixture.name} (ID: ${testFixture.id})`);
    console.log(`📊 Teams: ${testFixture.home_team?.name || 'Unknown'} vs ${testFixture.away_team?.name || 'Unknown'}`);
    console.log(`📊 Starting at: ${testFixture.starting_at}`);
    
    // Test the API call and see the raw response
    console.log(`🎯 Fetching odds for fixture ID: ${testFixture.id}`);
    console.log(`🔗 API URL: https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/${testFixture.id}?api_token=${SPORTMONKS_API_TOKEN}`);
    
    const oddsResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/${testFixture.id}?api_token=${SPORTMONKS_API_TOKEN}`);
    
    console.log(`📊 Response status: ${oddsResponse.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(oddsResponse.headers.entries()));
    
    if (!oddsResponse.ok) {
      console.log(`❌ Error fetching odds: HTTP ${oddsResponse.status}`);
      const errorText = await oddsResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const oddsData = await oddsResponse.json();
    console.log(`📊 Raw API response:`, JSON.stringify(oddsData, null, 2));
    
    const oddsArray = oddsData.data || [];
    
    if (oddsArray.length === 0) {
      console.log(`ℹ️ No odds found for ${testFixture.name}`);
      console.log(`📊 Response structure:`, Object.keys(oddsData));
      console.log(`📊 Data array length: ${oddsArray.length}`);
    } else {
      console.log(`✅ Found ${oddsArray.length} odds for ${testFixture.name}!`);
      console.log(`📊 Sample odds:`, oddsArray.slice(0, 3));
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugOddsTomorrow();

















