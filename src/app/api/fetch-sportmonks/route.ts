import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
const EUROPEAN_LEAGUE_IDS = [
  8, 9, 24, 27, 72, 82, 181, 208, 1371, 244, 271, 301, 384, 387, 390, 
  444, 453, 462, 486, 501, 564, 567, 570, 573, 591, 600, 609
];

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
  let currentStep = 'Initialization';
  
  try {
    console.log('🚀 Starting SportMonks data fetch...');
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
    
    // 7. Fetch fixtures for your selected leagues
    currentStep = 'Fetching Fixtures';
    console.log('🏟️ Step 7: Fetching fixtures...');
    const allFixtures: any[] = [];
    
    for (const leagueId of EUROPEAN_LEAGUE_IDS) {
      try {
        console.log(`Fetching fixtures for league ${leagueId}...`);
        const fixturesData = await fetchAllPages(
          `https://api.sportmonks.com/v3/football/fixtures/leagues/${leagueId}`,
          { include: 'participants;league;venue;state' }
        );
        
        // Process fixtures to extract home/away team IDs
        const processedFixtures = fixturesData.map((fixture: any) => {
          let homeTeamId = null;
          let awayTeamId = null;
          
          if (fixture.participants) {
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
            has_odds: fixture.has_odds,
            has_premium_odds: fixture.has_premium_odds,
            state_id: fixture.state_id,
            home_score: fixture.scores?.find((s: any) => s.description === 'CURRENT')?.score?.home || null,
            away_score: fixture.scores?.find((s: any) => s.description === 'CURRENT')?.score?.away || null
          };
        });
        
        allFixtures.push(...processedFixtures);
        console.log(`✅ Fetched ${processedFixtures.length} fixtures for league ${leagueId}`);
        
      } catch (error) {
        console.error(`❌ Error fetching fixtures for league ${leagueId}:`, error);
      }
    }
    
    currentStep = 'Populating Fixtures';
    console.log(`📊 Total fixtures to insert: ${allFixtures.length}`);
    await populateTable(supabase, 'fixtures', allFixtures, [
      'id', 'league_id', 'season_id', 'round_id', 'venue_id', 'home_team_id', 'away_team_id',
      'name', 'starting_at', 'starting_at_timestamp', 'has_odds', 'has_premium_odds',
      'state_id', 'home_score', 'away_score'
    ]);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`🎉 Data fetch completed successfully in ${duration} seconds!`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data fetched and stored successfully',
      fixturesCount: allFixtures.length,
      duration: `${duration}s`
    });
    
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