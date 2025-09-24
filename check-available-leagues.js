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

async function checkAvailableLeagues() {
  console.log('🔍 Checking available leagues...');
  
  try {
    // Check what leagues we have in our database
    const { data: ourLeagues, error: ourLeaguesError } = await supabase
      .from('leagues')
      .select('id, name, country:countries(name)')
      .order('name');
    
    if (ourLeaguesError) {
      console.log(`❌ Error fetching our leagues: ${ourLeaguesError.message}`);
    } else {
      console.log(`📊 Leagues in our database: ${ourLeagues?.length || 0}`);
      if (ourLeagues && ourLeagues.length > 0) {
        console.log('📊 Our leagues:');
        ourLeagues.forEach(league => {
          console.log(`  - ${league.name} (${league.country?.name || 'Unknown'}) - ID: ${league.id}`);
        });
      }
    }
    
    // Check what leagues are available via API
    console.log('\n📊 Checking available leagues via API...');
    const leaguesResponse = await fetch(`https://api.sportmonks.com/v3/football/leagues?api_token=${SPORTMONKS_API_TOKEN}&per_page=50`);
    
    if (!leaguesResponse.ok) {
      console.log(`❌ Error fetching leagues from API: HTTP ${leaguesResponse.status}`);
      const errorText = await leaguesResponse.text();
      console.log(`❌ Error details: ${errorText}`);
      return;
    }
    
    const leaguesData = await leaguesResponse.json();
    const apiLeagues = leaguesData.data || [];
    
    console.log(`📊 Available leagues via API: ${apiLeagues.length}`);
    
    // Look for Premier League specifically
    const premierLeague = apiLeagues.find(league => 
      league.name.toLowerCase().includes('premier') || 
      league.name.toLowerCase().includes('premier league') ||
      league.name.toLowerCase().includes('english premier')
    );
    
    if (premierLeague) {
      console.log(`✅ Found Premier League: "${premierLeague.name}" (ID: ${premierLeague.id})`);
    } else {
      console.log(`❌ Premier League not found in API response`);
    }
    
    // Look for other major leagues
    const majorLeagues = apiLeagues.filter(league => 
      league.name.toLowerCase().includes('premier') ||
      league.name.toLowerCase().includes('la liga') ||
      league.name.toLowerCase().includes('serie a') ||
      league.name.toLowerCase().includes('bundesliga') ||
      league.name.toLowerCase().includes('ligue 1') ||
      league.name.toLowerCase().includes('champions league')
    );
    
    console.log(`📊 Major leagues available: ${majorLeagues.length}`);
    majorLeagues.forEach(league => {
      console.log(`  - ${league.name} (ID: ${league.id})`);
    });
    
    // Show sample of all available leagues
    console.log('\n📊 Sample of all available leagues:');
    apiLeagues.slice(0, 10).forEach(league => {
      console.log(`  - ${league.name} (ID: ${league.id})`);
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkAvailableLeagues();


