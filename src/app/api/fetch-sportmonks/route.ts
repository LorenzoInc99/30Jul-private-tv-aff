import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
// Use the actual available leagues from the free plan
const AVAILABLE_LEAGUE_IDS = [271, 501, 513, 1659];

interface SportMonksResponse {
  data: any[];
  pagination?: {
    has_more: boolean;
    current_page: number;
  };
}

async function fetchFromSportMonks(url: string, params: Record<string, any> = {}) {
  if (!SPORTMONKS_API_TOKEN) {
    throw new Error('SPORTMONKS_API_TOKEN is not configured');
  }

  const fullParams = { api_token: SPORTMONKS_API_TOKEN, ...params };
  const queryString = new URLSearchParams(fullParams).toString();
  const fullUrl = `${url}?${queryString}`;
  
  console.log(`Fetching: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl);
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Response data keys: ${Object.keys(data)}`);
    return data as SportMonksResponse;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

async function fetchAllPages(url: string, params: Record<string, any> = {}) {
  const allData: any[] = [];
  let page = 1;
  let hasMore = true;
  
  console.log(`Starting to fetch all pages from: ${url}`);
  
  while (hasMore) {
    try {
      const response = await fetchFromSportMonks(url, { ...params, page });
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          allData.push(...response.data);
          console.log(`Page ${page}: Added ${response.data.length} items`);
        } else {
          allData.push(response.data);
          console.log(`Page ${page}: Added 1 item`);
        }
      } else {
        console.log(`Page ${page}: No data in response`);
      }
      
      hasMore = response.pagination?.has_more || false;
      page++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
      throw error;
    }
  }
  
  console.log(`Total items fetched: ${allData.length}`);
  return allData;
}

async function populateTable(supabase: any, tableName: string, data: any[], columns: string[]) {
  if (!data.length) {
    console.log(`No data to populate for ${tableName}`);
    return;
  }
  
  console.log(`Populating ${tableName} with ${data.length} records...`);
  
  try {
    const { error } = await supabase
      .from(tableName)
      .upsert(data.map(item => {
        const row: any = {};
        columns.forEach(col => row[col] = item[col]);
        return row;
      }), { onConflict: 'id' });
    
    if (error) {
      console.error(`Error populating ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Populated ${tableName} with ${data.length} records`);
  } catch (error) {
    console.error(`Failed to populate ${tableName}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let currentStep = 'Initializing';
  
  try {
    console.log('🚀 Starting comprehensive data fetch...');
    console.log('API Token configured:', !!SPORTMONKS_API_TOKEN);
    
    currentStep = 'Database Connection';
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // 1. Fetch and populate states (fixes your FK constraint issue)
    currentStep = 'Populating States';
    console.log('📊 Step 1: Populating states...');
    const statesData = [
      { id: 1, state: 'NS', name: 'Not Started', short_name: 'NS', developer_name: 'NS' },
      { id: 2, state: 'LIVE', name: 'Live', short_name: 'LIVE', developer_name: 'LIVE' },
      { id: 3, state: 'HT', name: 'Half Time', short_name: 'HT', developer_name: 'HT' },
      { id: 5, state: 'AET', name: 'After Extra Time', short_name: 'AET', developer_name: 'AET' },
      { id: 22, state: 'UNKNOWN', name: 'Unknown State', short_name: 'UNK', developer_name: 'UNKNOWN' }
    ];
    
    await populateTable(supabase, 'states', statesData, ['id', 'state', 'name', 'short_name', 'developer_name']);
    
    // 2. Fetch countries - FIXED: using correct endpoint
    currentStep = 'Fetching Countries';
    console.log('🌍 Step 2: Fetching countries...');
    const countriesData = await fetchAllPages('https://api.sportmonks.com/v3/core/countries');
    await populateTable(supabase, 'countries', countriesData, ['id', 'name', 'image_path']);
    
    // 3. Fetch bookmakers
    currentStep = 'Fetching Bookmakers';
    console.log('🎰 Step 3: Fetching bookmakers...');
    const bookmakersData = await fetchAllPages('https://api.sportmonks.com/v3/odds/bookmakers');
    await populateTable(supabase, 'bookmakers', bookmakersData, ['id', 'name', 'url', 'image_path']);
    
    // 4. Fetch leagues
    currentStep = 'Fetching Leagues';
    console.log('🏆 Step 4: Fetching leagues...');
    const leaguesData = await fetchAllPages('https://api.sportmonks.com/v3/football/leagues');
    await populateTable(supabase, 'leagues', leaguesData, ['id', 'name', 'sport_id', 'country_id']);
    
    // 5. Fetch TV stations
    currentStep = 'Fetching TV Stations';
    console.log('📺 Step 5: Fetching TV stations...');
    const tvStationsData = await fetchAllPages('https://api.sportmonks.com/v3/football/tv-stations');
    await populateTable(supabase, 'tvstations', tvStationsData, ['id', 'name', 'url', 'image_path']);
    
    // 6. Fetch teams
    currentStep = 'Fetching Teams';
    console.log('⚽ Step 6: Fetching teams...');
    const teamsData = await fetchAllPages('https://api.sportmonks.com/v3/football/teams');
    await populateTable(supabase, 'teams_new', teamsData, ['id', 'name', 'short_code', 'country_id', 'venue_id']);
    
    // 7. Fetch latest fixtures (this works with free plan)
    currentStep = 'Fetching Latest Fixtures';
    console.log('🏟️ Step 7: Fetching latest fixtures...');
    
    try {
      // Get fixtures for a 90-day window covering the season start (July-September 2025)
      const seasonStart = new Date('2025-07-01'); // July 1, 2025 (covers early starters)
      const seasonEnd = new Date('2025-09-30');   // September 30, 2025 (90 days)
      
      const startDate = seasonStart.toISOString().split('T')[0];
      const endDate = seasonEnd.toISOString().split('T')[0];
      
      console.log(`📅 Fetching fixtures for season start: ${startDate} to ${endDate}`);
      
      const fixturesData = await fetchAllPages(`https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}`, { include: 'participants' });
      
      // First, collect all teams from participants and sync them
      const allTeams = new Map();
      fixturesData.forEach((fixture: any) => {
        if (fixture.participants && Array.isArray(fixture.participants)) {
          fixture.participants.forEach((participant: any) => {
            allTeams.set(participant.id, {
              id: participant.id,
              name: participant.name,
              short_code: participant.short_code,
              country_id: participant.country_id,
              venue_id: participant.venue_id,
              team_logo_url: participant.image_path
            });
          });
        }
      });

      // Sync all teams first
      if (allTeams.size > 0) {
        console.log(`📊 Syncing ${allTeams.size} teams from fixtures...`);
        const { error: teamsError } = await supabase
          .from('teams_new')
          .upsert(Array.from(allTeams.values()), { onConflict: 'id' });
        
        if (teamsError) {
          console.error('❌ Error syncing teams:', teamsError);
        } else {
          console.log(`✅ Synced ${allTeams.size} teams`);
        }
      }

      // Process fixtures with team information from participants
      const allFixtures = fixturesData.map((fixture: any) => {
        let homeTeamId = null;
        let awayTeamId = null;
        
        // Extract team IDs from participants
        if (fixture.participants && Array.isArray(fixture.participants)) {
          fixture.participants.forEach((participant: any) => {
            if (participant.meta?.location === 'home') {
              homeTeamId = participant.id;
            } else if (participant.meta?.location === 'away') {
              awayTeamId = participant.id;
            }
          });
        }
        
        return {
          id: fixture.id,
          league_id: fixture.league_id,
          season_id: fixture.season_id,
          round_id: fixture.round_id,
          venue_id: fixture.venue_id,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          name: fixture.name,
          starting_at: fixture.starting_at,
          starting_at_timestamp: fixture.starting_at_timestamp,
          has_odds: fixture.has_odds || false,
          has_premium_odds: fixture.has_premium_odds || false,
          state_id: fixture.state_id || 1,
          home_score: fixture.home_score || null,
          away_score: fixture.away_score || null
        };
      });
      
      console.log(`✅ Fetched ${allFixtures.length} latest fixtures`);
      
      // 8. Populate fixtures
      currentStep = 'Populating Fixtures';
      console.log(`📊 Total fixtures to insert: ${allFixtures.length}`);
      await populateTable(supabase, 'fixtures', allFixtures, [
        'id', 'league_id', 'season_id', 'round_id', 'venue_id', 'home_team_id', 'away_team_id',
        'name', 'starting_at', 'starting_at_timestamp', 'has_odds', 'has_premium_odds',
        'state_id', 'home_score', 'away_score'
      ]);
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`🎉 Comprehensive data fetch completed successfully in ${duration} seconds!`);
      console.log(`📊 Summary:`);
      console.log(`   - Fixtures: ${allFixtures.length}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Comprehensive data fetched and stored successfully',
        fixturesCount: allFixtures.length,
        tvLinksCount: 0,
        oddsCount: 0,
        duration: `${duration}s`
      });
      
    } catch (error) {
      console.error(`❌ Error fetching latest fixtures:`, error);
      throw error;
    }
    
  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ Error in data fetch at step "${currentStep}":`, error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      step: currentStep,
      duration: `${duration}s`
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        step: currentStep,
        duration: `${duration}s`,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 