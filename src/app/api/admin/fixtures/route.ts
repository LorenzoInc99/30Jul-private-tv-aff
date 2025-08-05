import { NextRequest, NextResponse } from 'next/server';
import { insertData } from '@/lib/database';

interface FixturesConfig {
  startDate?: string;
  endDate?: string;
  daysBack?: number;
  daysForward?: number;
  targetLeagueIds?: number[];
  includeScores?: boolean;
  includeParticipants?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: FixturesConfig = {
      daysBack: 7,
      daysForward: 30,
      targetLeagueIds: [
        8,   // Premier League (England)
        9,   // Championship (England)
        24,  // League One (England)
        27,  // League Two (England)
        72,  // Eredivisie (Netherlands)
        82,  // Bundesliga (Germany)
        208, // Pro League (Belgium)
        1371, // UEFA Europa League Play-offs
        271, // Superliga (Denmark)
        301, // Ligue 1 (France)
        384, // Serie A (Italy)
        387, // Serie B (Italy)
        390, // Coppa Italia (Italy)
        444, // Norway
        462, // Liga Portugal (Portugal)
        501, // Scotland
        564, // La Liga (Spain)
        570, // Copa Del Rey (Spain)
        573, // Spain
        591, // Spain
        600, // Super Lig (Turkey)
      ],
      includeScores: true,
      includeParticipants: true,
      ...body
    };

    // Calculate date range
    const today = new Date();
    const startDate = config.startDate || 
      new Date(today.getTime() - (config.daysBack || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = config.endDate || 
      new Date(today.getTime() + (config.daysForward || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    logs.push(`Starting fixtures fetch with config:`);
    logs.push(`  Date range: ${startDate} to ${endDate}`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Include scores: ${config.includeScores}`);
    logs.push(`  Include participants: ${config.includeParticipants}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    // Fetch fixtures from API
    logs.push('Fetching fixtures from SportMonks API...');
    const fixturesData = await fetchFixturesFromAPI(
      API_TOKEN, 
      startDate, 
      endDate, 
      config.includeScores, 
      config.includeParticipants,
      logs
    );
    apiCalls += fixturesData.apiCalls;

    // Filter by target leagues
    logs.push('Filtering fixtures by target leagues...');
    const filteredFixtures = fixturesData.data.filter((fixture: any) => 
      config.targetLeagueIds?.includes(fixture.league_id)
    );
    logs.push(`  Total fixtures: ${fixturesData.data.length}`);
    logs.push(`  Filtered fixtures: ${filteredFixtures.length}`);

    // Process and save to database
    logs.push('Processing and saving fixtures to database...');
    await saveFixturesToDatabase(filteredFixtures, logs);

    const duration = Date.now() - startTime;
    logs.push(`✅ Fixtures fetch completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Fixtures processed: ${filteredFixtures.length}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        totalFixtures: fixturesData.data.length,
        filteredFixtures: filteredFixtures.length,
        dateRange: { startDate, endDate },
        targetLeagues: config.targetLeagueIds?.length || 0
      }
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ Error: ${error.message}`);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      apiCalls,
      logs
    }, { status: 500 });
  }
}

async function fetchFixturesFromAPI(
  apiToken: string, 
  startDate: string, 
  endDate: string, 
  includeScores: boolean, 
  includeParticipants: boolean,
  logs: string[]
) {
  const url = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}`;
  
  const includeParams = [];
  if (includeParticipants) includeParams.push('participants');
  if (includeScores) includeParams.push('scores');
  
  const params = {
    api_token: apiToken,
    per_page: 100,
    order: 'starting_at:asc'
  };

  if (includeParams.length > 0) {
    params.include = includeParams.join(';');
  }

  const allFixtures = [];
  let page = 1;
  let apiCalls = 0;
  let hasMore = true;
  const maxPages = 100; // More pages for fixtures

  while (hasMore && page <= maxPages) {
    try {
      const currentParams = { ...params, page };
      const response = await fetch(`${url}?${new URLSearchParams(currentParams)}`);
      apiCalls++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data) {
        allFixtures.push(...data.data);
      }

      if (data.pagination) {
        hasMore = data.pagination.has_more || false;
        page++;
      } else {
        hasMore = false;
      }

      logs.push(`  Fixtures page ${page - 1}: ${data.data?.length || 0} fixtures`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      logs.push(`  Error fetching fixtures page ${page}: ${error.message}`);
      break;
    }
  }

  return {
    data: allFixtures,
    apiCalls
  };
}

function extractScoresFromFixture(fixture: any) {
  let homeScore = null;
  let awayScore = null;

  const scoresData = fixture.scores || [];

  if (scoresData.length === 0) {
    return { homeScore, awayScore };
  }

  // First, try to find CURRENT score (for live matches)
  const currentScores = scoresData.filter((s: any) => s.description === 'CURRENT');

  if (currentScores.length > 0) {
    for (const scoreEntry of currentScores) {
      const scoreData = scoreEntry.score || {};
      const participant = scoreData.participant;
      const goals = scoreData.goals;

      if (participant === 'home' && goals !== null && goals !== undefined) {
        homeScore = parseInt(goals);
      } else if (participant === 'away' && goals !== null && goals !== undefined) {
        awayScore = parseInt(goals);
      }
    }
  }

  // If no CURRENT score or incomplete, try 2ND_HALF (full-time)
  if (homeScore === null || awayScore === null) {
    const secondHalfScores = scoresData.filter((s: any) => s.description === '2ND_HALF');

    for (const scoreEntry of secondHalfScores) {
      const scoreData = scoreEntry.score || {};
      const participant = scoreData.participant;
      const goals = scoreData.goals;

      if (participant === 'home' && goals !== null && goals !== undefined) {
        homeScore = parseInt(goals);
      } else if (participant === 'away' && goals !== null && goals !== undefined) {
        awayScore = parseInt(goals);
      }
    }
  }

  // If still incomplete, try 1ST_HALF as fallback
  if (homeScore === null || awayScore === null) {
    const firstHalfScores = scoresData.filter((s: any) => s.description === '1ST_HALF');

    for (const scoreEntry of firstHalfScores) {
      const scoreData = scoreEntry.score || {};
      const participant = scoreData.participant;
      const goals = scoreData.goals;

      if (participant === 'home' && goals !== null && goals !== undefined) {
        homeScore = parseInt(goals);
      } else if (participant === 'away' && goals !== null && goals !== undefined) {
        awayScore = parseInt(goals);
      }
    }
  }

  return { homeScore, awayScore };
}

async function saveFixturesToDatabase(fixtures: any[], logs: string[]) {
  try {
    const fixtureRecords = [];
    let processedCount = 0;
    let scoreFoundCount = 0;

    for (const fixture of fixtures) {
      const fixtureId = fixture.id;

      // Process Participants Data to get home and away team IDs
      let homeTeamId = null;
      let awayTeamId = null;
      const participants = fixture.participants || [];
      
      for (const participant of participants) {
        if (participant.meta?.location === 'home') {
          homeTeamId = participant.id;
        } else if (participant.meta?.location === 'away') {
          awayTeamId = participant.id;
        }
      }

      // Process Scores Data
      const { homeScore, awayScore } = extractScoresFromFixture(fixture);

      if (homeScore !== null || awayScore !== null) {
        scoreFoundCount++;
      }

      const fixtureValues = {
        id: fixtureId,
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
        home_score: homeScore,
        away_score: awayScore
      };

      fixtureRecords.push(fixtureValues);
      processedCount++;
    }

    logs.push(`  Processed ${processedCount} fixtures, found scores for ${scoreFoundCount} fixtures`);

    // Batch insert/update fixtures
    if (fixtureRecords.length > 0) {
      const result = await insertData('fixtures', fixtureRecords);
      if (!result.success) throw new Error(result.error);
      logs.push(`  Saved ${fixtureRecords.length} fixtures to database`);
    }

  } catch (error: any) {
    logs.push(`❌ Database error: ${error.message}`);
    throw error;
  }
} 