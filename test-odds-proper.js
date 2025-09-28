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

async function testOddsProper() {
  console.log('🎯 Testing odds with proper approach...');
  
  try {
    let apiCalls = 0;
    let oddsCount = 0;
    
    // Get our current fixture IDs
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 5);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = futureDate.toISOString().split('T')[0];
    
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, name, starting_at')
      .gte('starting_at', startDate)
      .lte('starting_at', endDate)
      .order('starting_at', { ascending: true });
    
    if (fixturesError) {
      throw new Error(`Database error: ${fixturesError.message}`);
    }
    
    if (!fixtures || fixtures.length === 0) {
      console.log('✅ No fixtures found for this date range');
      return;
    }
    
    const ourFixtureIds = fixtures.map(f => f.id);
    console.log(`📊 Found ${fixtures.length} fixtures in our database`);
    console.log(`📊 Our fixture IDs: ${ourFixtureIds.slice(0, 5).join(', ')}...`);
    
    // Fetch all available odds (limited to first page to minimize API calls)
    apiCalls++;
    console.log('📊 Fetching available odds...');
    
    const oddsResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match?api_token=${SPORTMONKS_API_TOKEN}&per_page=50`);
    
    if (!oddsResponse.ok) {
      throw new Error(`Failed to fetch odds: ${oddsResponse.statusText}`);
    }
    
    const oddsData = await oddsResponse.json();
    const oddsArray = oddsData.data || [];
    
    console.log(`📊 Found ${oddsArray.length} odds records from API`);
    
    if (oddsArray.length === 0) {
      console.log('✅ No odds data available');
      return;
    }
    
    // Get unique fixture IDs from odds data
    const oddsFixtureIds = [...new Set(oddsArray.map(odd => odd.fixture_id))];
    console.log(`📊 Odds fixture IDs: ${oddsFixtureIds.slice(0, 5).join(', ')}...`);
    
    // Check if any odds match our fixtures
    const matchingFixtures = oddsFixtureIds.filter(id => ourFixtureIds.includes(id));
    console.log(`📊 Matching fixtures: ${matchingFixtures.length}`);
    
    if (matchingFixtures.length === 0) {
      console.log('ℹ️ No odds found for our current fixtures (this is normal for future matches)');
      console.log('📊 Sample odds fixture IDs:', oddsFixtureIds.slice(0, 3));
      console.log('📊 Sample our fixture IDs:', ourFixtureIds.slice(0, 3));
    } else {
      console.log(`✅ Found odds for ${matchingFixtures.length} of our fixtures!`);
    }
    
    // Fetch bookmakers
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
    
    // Process odds data (focus on Match Winner market - ID 1)
    const matchWinnerOdds = oddsArray.filter(odd => odd.market_id === 1);
    console.log(`📊 Found ${matchWinnerOdds.length} Match Winner odds (market_id: 1)`);
    
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
          console.log(`  - Fixture ${odd.fixture_id}: ${odd.label} @ ${odd.value} (${odd.probability ? (odd.probability * 100).toFixed(1) + '%' : 'N/A'}) - Bookmaker ${odd.bookmaker_id}`);
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

testOddsProper();






