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

async function testFixtureOdds() {
  console.log('🎯 Testing odds for a specific fixture...');
  
  try {
    let apiCalls = 0;
    let oddsCount = 0;
    
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
    
    // Fetch bookmakers first
    apiCalls++;
    const bookmakersResponse = await fetch(`https://api.sportmonks.com/v3/odds/bookmakers?api_token=${SPORTMONKS_API_TOKEN}`);
    if (!bookmakersResponse.ok) {
      throw new Error(`Failed to fetch bookmakers: ${bookmakersResponse.statusText}`);
    }
    const bookmakersData = await bookmakersResponse.json();
    const bookmakers = bookmakersData.data || [];
    
    if (bookmakers.length > 0) {
      const { error: upsertBmError } = await supabase
        .from('bookmakers')
        .upsert(bookmakers.map((bm) => ({
          id: bm.id,
          name: bm.name,
          url: bm.url,
          image_path: bm.image_path
        })), { onConflict: 'id' });
      
      if (upsertBmError) {
        console.log(`⚠️ Error upserting bookmakers: ${upsertBmError.message}`);
      } else {
        console.log(`✅ Upserted ${bookmakers.length} bookmakers`);
      }
    }
    
    // Test odds for this specific fixture using the correct endpoint
    apiCalls++;
    console.log(`🎯 Fetching odds for fixture ID: ${testFixture.id}`);
    
    const oddsResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/${testFixture.id}?api_token=${SPORTMONKS_API_TOKEN}`);
    
    if (!oddsResponse.ok) {
      console.log(`❌ Error fetching odds for ${testFixture.name}: HTTP ${oddsResponse.status}`);
      const errorText = await oddsResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const oddsData = await oddsResponse.json();
    const oddsArray = oddsData.data || [];
    
    if (oddsArray.length === 0) {
      console.log(`ℹ️ No odds found for ${testFixture.name} (this is normal for future matches)`);
      return;
    }
    
    console.log(`✅ Found ${oddsArray.length} odds for ${testFixture.name}!`);
    
    // Filter for Match Winner odds (market_id: 1)
    const matchWinnerOdds = oddsArray.filter(odd => odd.market_id === 1);
    console.log(`📊 Match Winner odds: ${matchWinnerOdds.length}`);
    
    // Process odds data
    const oddsToUpsert = [];
    
    for (const odd of matchWinnerOdds) {
      // Parse probability from percentage string (e.g., "67.57%" -> 0.6757)
      let probability = null;
      if (odd.probability && typeof odd.probability === 'string' && odd.probability.includes('%')) {
        const percentValue = parseFloat(odd.probability.replace('%', ''));
        probability = percentValue / 100; // Convert to decimal
      }
      
      oddsToUpsert.push({
        id: odd.id,
        fixture_id: odd.fixture_id,
        bookmaker_id: odd.bookmaker_id,
        market_id: odd.market_id,
        label: odd.label,
        value: parseFloat(odd.value),
        probability: probability,
        latest_bookmaker_update: odd.latest_bookmaker_update
      });
    }
    
    if (oddsToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('odds')
        .upsert(oddsToUpsert, { onConflict: 'id' });
      
      if (upsertError) {
        console.log(`❌ Database error: ${upsertError.message}`);
      } else {
        oddsCount = oddsToUpsert.length;
        console.log(`✅ Successfully stored ${oddsCount} Match Winner odds`);
        
        // Show sample of stored odds
        console.log('📊 Sample odds stored:');
        const sampleOdds = oddsToUpsert.slice(0, 5);
        sampleOdds.forEach(odd => {
          console.log(`  - ${odd.label}: ${odd.value} (${odd.probability ? (odd.probability * 100).toFixed(1) + '%' : 'N/A'}) - Bookmaker ${odd.bookmaker_id}`);
        });
      }
    }
    
    console.log(`🎉 Test completed!`);
    console.log(`📊 API calls used: ${apiCalls}`);
    console.log(`📊 Odds records stored: ${oddsCount}`);
    console.log(`📊 Bookmakers stored: ${bookmakers.length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testFixtureOdds();
