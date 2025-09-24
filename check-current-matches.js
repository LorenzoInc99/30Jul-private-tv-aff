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

async function checkCurrentMatches() {
  console.log('🔍 Checking what matches are in your database...');
  
  try {
    // Check today's matches
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
    } else {
      console.log(`📊 Today's matches: ${todayMatches?.length || 0}`);
      if (todayMatches && todayMatches.length > 0) {
        console.log('📊 Sample today matches:');
        todayMatches.slice(0, 3).forEach(match => {
          console.log(`  - ${match.home_team?.name || 'Unknown'} vs ${match.away_team?.name || 'Unknown'} (${match.league?.name || 'Unknown'}) - ${match.starting_at}`);
        });
      }
    }
    
    // Check tomorrow's matches
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    console.log(`📅 Tomorrow: ${tomorrowDate}`);
    
    const { data: tomorrowMatches, error: tomorrowError } = await supabase
      .from('fixtures')
      .select(`
        id, 
        name, 
        starting_at,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name),
        league:leagues(name)
      `)
      .gte('starting_at', tomorrowDate)
      .lt('starting_at', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('starting_at', { ascending: true });
    
    if (tomorrowError) {
      console.log(`❌ Error fetching tomorrow's matches: ${tomorrowError.message}`);
    } else {
      console.log(`📊 Tomorrow's matches: ${tomorrowMatches?.length || 0}`);
      if (tomorrowMatches && tomorrowMatches.length > 0) {
        console.log('📊 Sample tomorrow matches:');
        tomorrowMatches.slice(0, 3).forEach(match => {
          console.log(`  - ${match.home_team?.name || 'Unknown'} vs ${match.away_team?.name || 'Unknown'} (${match.league?.name || 'Unknown'}) - ${match.starting_at}`);
        });
      }
    }
    
    // Check what leagues we have
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('id, name, country:countries(name)')
      .order('name');
    
    if (leaguesError) {
      console.log(`❌ Error fetching leagues: ${leaguesError.message}`);
    } else {
      console.log(`📊 Total leagues: ${leagues?.length || 0}`);
      if (leagues && leagues.length > 0) {
        console.log('📊 Sample leagues:');
        leagues.slice(0, 5).forEach(league => {
          console.log(`  - ${league.name} (${league.country?.name || 'Unknown'})`);
        });
      }
    }
    
    // Check recent fixtures (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoDate = weekAgo.toISOString().split('T')[0];
    
    const { data: recentMatches, error: recentError } = await supabase
      .from('fixtures')
      .select(`
        id, 
        name, 
        starting_at,
        home_team:teams_new!home_team_id(name),
        away_team:teams_new!away_team_id(name),
        league:leagues(name)
      `)
      .gte('starting_at', weekAgoDate)
      .order('starting_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      console.log(`❌ Error fetching recent matches: ${recentError.message}`);
    } else {
      console.log(`📊 Recent matches (last 7 days): ${recentMatches?.length || 0}`);
      if (recentMatches && recentMatches.length > 0) {
        console.log('📊 Sample recent matches:');
        recentMatches.slice(0, 5).forEach(match => {
          console.log(`  - ${match.home_team?.name || 'Unknown'} vs ${match.away_team?.name || 'Unknown'} (${match.league?.name || 'Unknown'}) - ${match.starting_at}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkCurrentMatches();


