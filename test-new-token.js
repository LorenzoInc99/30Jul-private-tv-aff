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

async function testNewToken() {
  console.log('🎯 Testing new API token...');
  
  const NEW_TOKEN = 'RFjD7l2WP93DguhRiVVy9agiNZ7NUJScdKaZLmDPLbHSbGnKLNVoR9XsgzjH';
  
  try {
    // Test 1: Check subscription status
    console.log('📊 Testing subscription status...');
    const subscriptionResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match?api_token=${NEW_TOKEN}&per_page=1`);
    
    console.log(`📊 Response status: ${subscriptionResponse.status}`);
    
    if (!subscriptionResponse.ok) {
      console.log(`❌ Error: HTTP ${subscriptionResponse.status}`);
      const errorText = await subscriptionResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const subscriptionData = await subscriptionResponse.json();
    console.log(`📊 Subscription data:`, JSON.stringify(subscriptionData, null, 2));
    
    // Test 2: Get today's matches from our database
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    
    console.log(`📅 Today: ${todayDate}`);
    
    const { data: todayMatches, error: todayError } = await supabase
      .from('fixtures')
      .select(`
        id, 
        name, 
        starting_at,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name),
        league:leagues(name)
      `)
      .gte('starting_at', todayDate)
      .lt('starting_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('starting_at', { ascending: true });
    
    if (todayError) {
      console.log(`❌ Error fetching today's matches: ${todayError.message}`);
      return;
    }
    
    if (!todayMatches || todayMatches.length === 0) {
      console.log('✅ No matches found for today');
      return;
    }
    
    console.log(`📊 Found ${todayMatches.length} matches for today`);
    
    // Test 3: Try to get odds for the first match
    const testMatch = todayMatches[0];
    console.log(`🎯 Testing odds for: ${testMatch.name} (ID: ${testMatch.id})`);
    console.log(`📊 Teams: ${testMatch.home_team?.name || 'Unknown'} vs ${testMatch.away_team?.name || 'Unknown'}`);
    console.log(`📊 League: ${testMatch.league?.name || 'Unknown'}`);
    console.log(`📊 Starting at: ${testMatch.starting_at}`);
    
    const oddsResponse = await fetch(`https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/${testMatch.id}?api_token=${NEW_TOKEN}`);
    
    console.log(`📊 Odds response status: ${oddsResponse.status}`);
    
    if (!oddsResponse.ok) {
      console.log(`❌ Error fetching odds: HTTP ${oddsResponse.status}`);
      const errorText = await oddsResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const oddsData = await oddsResponse.json();
    console.log(`📊 Odds response:`, JSON.stringify(oddsData, null, 2));
    
    const oddsArray = oddsData.data || [];
    
    if (oddsArray.length === 0) {
      console.log(`ℹ️ No odds found for ${testMatch.name}`);
    } else {
      console.log(`✅ Found ${oddsArray.length} odds for ${testMatch.name}!`);
      
      // Show sample odds
      console.log('📊 Sample odds:');
      oddsArray.slice(0, 5).forEach(odd => {
        console.log(`  - ${odd.label}: ${odd.value} (${odd.probability || 'N/A'}) - Bookmaker ${odd.bookmaker_id} - Market ${odd.market_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testNewToken();












