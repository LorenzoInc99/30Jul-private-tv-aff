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

async function testAvailableOdds() {
  console.log('🎯 Testing with available odds data...');
  
  try {
    let apiCalls = 0;
    let oddsCount = 0;
    
    // Fetch available odds (limited to first page to minimize API calls)
    apiCalls++;
    console.log('📊 Fetching available odds...');
    
    const oddsResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match?api_token=${SPORTMONKS_API_TOKEN}&per_page=50`);
    
    if (!oddsResponse.ok) {
      throw new Error(`Failed to fetch odds: ${oddsResponse.statusText}`);
    }
    
    const oddsData = await oddsResponse.json();
    const oddsArray = oddsData.data || [];
    
    console.log(`📊 Found ${oddsArray.length} odds records`);
    
    if (oddsArray.length === 0) {
      console.log('✅ No odds data available');
      return;
    }
    
    // Get unique bookmaker IDs and fetch bookmaker info
    const bookmakerIds = [...new Set(oddsArray.map(odd => odd.bookmaker_id))];
    console.log(`📊 Found ${bookmakerIds.length} unique bookmakers`);
    
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
    
    // Process odds data
    const oddsToUpsert = [];
    
    for (const odd of oddsArray) {
      // Parse probability from percentage string (e.g., "56.5%" -> 0.565)
      let probability = null;
      if (odd.probability && typeof odd.probability === 'string' && odd.probability.includes('%')) {
        const percentValue = parseFloat(odd.probability.replace('%', ''));
        probability = percentValue / 100; // Convert to decimal
      }
      
      oddsToUpsert.push({
        id: odd.id, // Use the ID from the API response
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
        .upsert(oddsToUpsert, { onConflict: 'fixture_id,bookmaker_id,market_id,label' });
      
      if (upsertError) {
        console.log(`❌ Database error: ${upsertError.message}`);
      } else {
        oddsCount = oddsToUpsert.length;
        console.log(`✅ Successfully stored ${oddsCount} odds records`);
        
        // Show sample of stored odds
        console.log('📊 Sample odds stored:');
        const sampleOdds = oddsToUpsert.slice(0, 3);
        sampleOdds.forEach(odd => {
          console.log(`  - Fixture ${odd.fixture_id}: ${odd.label} @ ${odd.value} (${odd.probability}) - Bookmaker ${odd.bookmaker_id}`);
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

testAvailableOdds();
