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

async function testTVStations() {
  console.log('🎯 Testing TV stations for current fixtures...');
  
  try {
    let apiCalls = 0;
    let tvLinksCount = 0;
    
    // Get current fixtures from our database (today + 5 days)
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 5);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = futureDate.toISOString().split('T')[0];
    
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
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
    
    console.log(`📊 Found ${fixtures.length} fixtures in our database`);
    
    // Test with first 3 fixtures to minimize API calls
    const testFixtures = fixtures.slice(0, 3);
    console.log(`🎯 Testing TV stations for ${testFixtures.length} current fixtures`);
    
    // Fetch TV stations first
    apiCalls++;
    const tvStationsResponse = await fetch(`https://api.sportmonks.com/v3/football/tv-stations?api_token=${SPORTMONKS_API_TOKEN}`);
    if (!tvStationsResponse.ok) {
      throw new Error(`Failed to fetch TV stations: ${tvStationsResponse.statusText}`);
    }
    const tvStationsData = await tvStationsResponse.json();
    const tvStations = tvStationsData.data || [];
    
    if (tvStations.length > 0) {
      const { error: upsertTvError } = await supabase
        .from('tvstations')
        .upsert(tvStations.map((tv) => ({
          id: tv.id,
          name: tv.name,
          url: tv.url,
          image_path: tv.image_path
        })), { onConflict: 'id' });
      
      if (upsertTvError) {
        console.log(`⚠️ Error upserting TV stations: ${upsertTvError.message}`);
      } else {
        console.log(`✅ Upserted ${tvStations.length} TV stations`);
      }
    }
    
    // Test TV stations for each current fixture
    for (const fixture of testFixtures) {
      try {
        apiCalls++;
        console.log(`🎯 Testing TV stations for: ${fixture.name} (ID: ${fixture.id})`);
        
        // Fetch TV stations for this fixture
        const fixtureTvResponse = await fetch(`https://api.sportmonks.com/v3/football/fixtures/${fixture.id}?api_token=${SPORTMONKS_API_TOKEN}&include=tvstations`);
        
        if (!fixtureTvResponse.ok) {
          console.log(`❌ Error fetching TV stations for ${fixture.name}: HTTP ${fixtureTvResponse.status}`);
          continue;
        }
        
        const fixtureData = await fixtureTvResponse.json();
        const tvRelationships = fixtureData.data?.tvstations || [];
        
        if (tvRelationships.length === 0) {
          console.log(`ℹ️ No TV stations found for ${fixture.name} (this is normal for some matches)`);
          continue;
        }
        
        console.log(`✅ Found ${tvRelationships.length} TV stations for ${fixture.name}`);
        
        // Process TV station relationships
        const fixtureTvDataToUpsert = [];
        
        for (const tvRel of tvRelationships) {
          const tvStationId = tvRel.tvstation_id || tvRel.id;
          const countryId = tvRel.country_id || 1; // Default to 1 if not provided
          
          if (tvStationId) {
            fixtureTvDataToUpsert.push({
              fixture_id: fixture.id,
              tvstation_id: tvStationId,
              country_id: countryId
            });
          }
        }
        
        if (fixtureTvDataToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('fixturetvstations')
            .upsert(fixtureTvDataToUpsert, { onConflict: 'fixture_id,tvstation_id' });
          
          if (upsertError) {
            console.log(`❌ Database error for ${fixture.name}: ${upsertError.message}`);
          } else {
            tvLinksCount += fixtureTvDataToUpsert.length;
            console.log(`✅ Stored ${fixtureTvDataToUpsert.length} TV station links for ${fixture.name}`);
            
            // Show sample TV stations
            const sampleTv = fixtureTvDataToUpsert.slice(0, 3);
            sampleTv.forEach(tv => {
              console.log(`  - TV Station ${tv.tvstation_id} (Country ${tv.country_id})`);
            });
          }
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error processing ${fixture.name}: ${error.message}`);
      }
    }
    
    console.log(`🎉 Test completed!`);
    console.log(`📊 API calls used: ${apiCalls}`);
    console.log(`📊 TV station links stored: ${tvLinksCount}`);
    console.log(`📊 Fixtures tested: ${testFixtures.length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testTVStations();





