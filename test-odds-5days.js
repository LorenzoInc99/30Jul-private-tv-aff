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

async function testOdds5Days() {
  console.log('🎯 Testing odds for today + 5 days...');
  
  try {
    // Get today + 5 days range
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 5);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = futureDate.toISOString().split('T')[0];
    
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    // Get fixtures for this range
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, name, starting_at, has_odds')
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
    
    console.log(`📊 Found ${fixtures.length} fixtures for testing`);
    
    // Test with first 3 fixtures to minimize API calls
    const testFixtures = fixtures.slice(0, 3);
    console.log(`🎯 Testing odds for ${testFixtures.length} fixtures to minimize API calls`);
    
    let apiCalls = 0;
    let oddsCount = 0;
    
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
    
    // Test odds for each fixture
    for (const fixture of testFixtures) {
      try {
        apiCalls++;
        console.log(`🎯 Testing odds for: ${fixture.name} (${fixture.starting_at})`);
        
        // Fetch pre-match odds for this fixture
        const oddsResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match?api_token=${SPORTMONKS_API_TOKEN}&filters=fixture_id:${fixture.id}`);
        
        if (!oddsResponse.ok) {
          console.log(`❌ Error fetching odds for ${fixture.name}: HTTP ${oddsResponse.status}`);
          continue;
        }
        
        const oddsData = await oddsResponse.json();
        const oddsArray = oddsData.data || [];
        const oddsToUpsert = [];
        
        // Process each odd directly (no nested structure)
        for (const odd of oddsArray) {
          oddsToUpsert.push({
            fixture_id: odd.fixture_id,
            bookmaker_id: odd.bookmaker_id,
            market_id: odd.market_id,
            label: odd.label,
            value: parseFloat(odd.value),
            probability: odd.probability,
            latest_bookmaker_update: odd.latest_bookmaker_update
          });
        }
        
        if (oddsToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('odds')
            .upsert(oddsToUpsert, { onConflict: 'fixture_id,bookmaker_id,market_id,label' });
          
          if (upsertError) {
            console.log(`❌ Database error for ${fixture.name}: ${upsertError.message}`);
          } else {
            oddsCount += oddsToUpsert.length;
            console.log(`✅ Updated ${oddsToUpsert.length} odds for ${fixture.name}`);
          }
        } else {
          console.log(`ℹ️ No odds found for ${fixture.name}`);
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error processing ${fixture.name}: ${error.message}`);
      }
    }
    
    console.log(`🎉 Test completed!`);
    console.log(`📊 API calls used: ${apiCalls}`);
    console.log(`📊 Odds records: ${oddsCount}`);
    console.log(`📊 Fixtures tested: ${testFixtures.length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOdds5Days();
