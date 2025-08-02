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
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return allData;
}

function extractScoresFromFixture(fixture: any) {
  let homeScore = null;
  let awayScore = null;

  const scoresData = fixture.scores || [];

  if (!scoresData.length) {
    return { homeScore: null, awayScore: null };
  }

  // First, try to find CURRENT score (for live matches)
  const currentScores = scoresData.filter((s: any) => s.description === "CURRENT");

  if (currentScores.length) {
    for (const scoreEntry of currentScores) {
      const scoreData = scoreEntry.score || {};
      const participant = scoreData.participant;
      const goals = scoreData.goals;

      if (participant === "home" && goals !== null && goals !== undefined) {
        homeScore = parseInt(goals);
      } else if (participant === "away" && goals !== null && goals !== undefined) {
        awayScore = parseInt(goals);
      }
    }
  }

  // If no CURRENT score or incomplete, try 2ND_HALF (full-time)
  if (homeScore === null || awayScore === null) {
    const secondHalfScores = scoresData.filter((s: any) => s.description === "2ND_HALF");

    for (const scoreEntry of secondHalfScores) {
      const scoreData = scoreEntry.score || {};
      const participant = scoreData.participant;
      const goals = scoreData.goals;

      if (participant === "home" && goals !== null && goals !== undefined) {
        homeScore = parseInt(goals);
      } else if (participant === "away" && goals !== null && goals !== undefined) {
        awayScore = parseInt(goals);
      }
    }
  }

  // If still incomplete, try 1ST_HALF as fallback
  if (homeScore === null || awayScore === null) {
    const firstHalfScores = scoresData.filter((s: any) => s.description === "1ST_HALF");

    for (const scoreEntry of firstHalfScores) {
      const scoreData = scoreEntry.score || {};
      const participant = scoreData.participant;
      const goals = scoreData.goals;

      if (participant === "home" && goals !== null && goals !== undefined) {
        homeScore = parseInt(goals);
      } else if (participant === "away" && goals !== null && goals !== undefined) {
        awayScore = parseInt(goals);
      }
    }
  }

  return { homeScore, awayScore };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  let fixturesUpdated = 0;
  
  try {
    const { startDate, endDate } = await request.json();
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // Use the date range endpoint to get fixtures
    const url = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}`;
    
    apiCalls++;
    const fixturesData = await fetchAllPages(url, {
      include: 'participants;scores;league;venue;state'
    });
    
    if (!fixturesData || fixturesData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fixtures found in the specified date range',
        apiCalls,
        duration: '0s',
        timestamp: new Date().toISOString(),
        details: { fixturesUpdated: 0 }
      });
    }
    
    // Filter to only include our target leagues
    const filteredFixtures = fixturesData.filter((fixture: any) => 
      EUROPEAN_LEAGUE_IDS.includes(fixture.league_id)
    );
    
    // Process fixtures to extract home/away team IDs and scores
    const processedFixtures = filteredFixtures.map((fixture: any) => {
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
      
      const { homeScore, awayScore } = extractScoresFromFixture(fixture);
      
      return {
        id: fixture.id,
        sport_id: fixture.sport_id,
        league_id: fixture.league_id,
        season_id: fixture.season_id,
        stage_id: fixture.stage_id,
        group_id: fixture.group_id,
        aggregate_id: fixture.aggregate_id,
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
        away_team_id: awayTeamId,
        home_score: homeScore,
        away_score: awayScore
      };
    });
    
    // Update fixtures in database
    if (processedFixtures.length > 0) {
      const { error } = await supabase
        .from('fixtures')
        .upsert(processedFixtures, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      fixturesUpdated = processedFixtures.length;
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${fixturesUpdated} fixtures`,
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        totalFixturesFound: fixturesData.length,
        filteredFixtures: filteredFixtures.length,
        fixturesUpdated
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