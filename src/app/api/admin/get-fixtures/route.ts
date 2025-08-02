import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
const EUROPEAN_LEAGUE_IDS = [
  8, 9, 24, 27, 72, 82, 181, 208, 1371, 244, 271, 301, 384, 387, 390, 
  444, 453, 462, 486, 501, 564, 567, 570, 573, 591, 600, 609
];

async function fetchFromSportMonks(url: string, params: Record<string, any> = {}) {
  if (!SPORTMONKS_API_TOKEN) {
    throw new Error('SPORTMONKS_API_TOKEN is not configured');
  }

  const fullParams = { api_token: SPORTMONKS_API_TOKEN, ...params };
  const queryString = new URLSearchParams(fullParams).toString();
  const fullUrl = `${url}?${queryString}`;
  
  const response = await fetch(fullUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  
  return await response.json();
}

async function fetchAllPages(url: string, params: Record<string, any> = {}) {
  const allData: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetchFromSportMonks(url, { ...params, page });
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        allData.push(...response.data);
      } else {
        allData.push(response.data);
      }
    }
    
    hasMore = response.pagination?.has_more || false;
    page++;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return allData;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  
  try {
    const { daysAhead = 7 } = await request.json();
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    const allFixtures: any[] = [];
    
    for (const leagueId of EUROPEAN_LEAGUE_IDS) {
      try {
        apiCalls++;
        const fixturesData = await fetchAllPages(
          `https://api.sportmonks.com/v3/football/fixtures/leagues/${leagueId}`,
          { 
            include: 'participants;league;venue;state',
            filter: `starting_at:gte:${new Date().toISOString().split('T')[0]}`
          }
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
            sport_id: fixture.sport_id,
            league_id: fixture.league_id,
            season_id: fixture.season_id,
            stage_id: fixture.stage_id,
            group_id: fixture.group_id,
            round_id: fixture.round_id,
            state_id: fixture.state_id,
            venue_id: fixture.venue_id,
            name: fixture.name,
            starting_at: fixture.starting_at,
            result_info: fixture.result_info,
            leg: fixture.leg,
            details: fixture.details,
            length: fixture.length,
            placeholder: fixture.placeholder,
            starting_at_timestamp: fixture.starting_at_timestamp,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId
          };
        });
        
        allFixtures.push(...processedFixtures);
        
      } catch (error) {
        console.error(`Error fetching fixtures for league ${leagueId}:`, error);
      }
    }
    
    // Insert fixtures into database
    if (allFixtures.length > 0) {
      const { error } = await supabase
        .from('fixtures')
        .upsert(allFixtures, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${allFixtures.length} fixtures for the next ${daysAhead} days`,
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        fixturesCount: allFixtures.length,
        leaguesProcessed: EUROPEAN_LEAGUE_IDS.length
      }
    });
    
  } catch (error) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 