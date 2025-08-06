import { NextRequest, NextResponse } from 'next/server';
import { insertData, executeQuery } from '@/lib/database';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
const TARGET_LEAGUE_IDS = [
  8,   // Premier League (England)
  72,  // Eredivisie (Netherlands)
  82,  // Bundesliga (Germany)
  208, // Pro League (Belgium)
  1371, // UEFA Europa League Play-offs (International)
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
];

interface StandingsConfig {
  targetLeagueIds?: number[];
  includeCurrentSeasonOnly?: boolean;
}

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
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: StandingsConfig = {
      targetLeagueIds: TARGET_LEAGUE_IDS,
      includeCurrentSeasonOnly: true,
      ...body
    };

    logs.push(`Starting standings fetch with config:`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Current season only: ${config.includeCurrentSeasonOnly}`);

    // First, get current seasons for target leagues
    logs.push('Fetching current seasons for target leagues...');
    const seasonsResult = await executeQuery(`
      SELECT id, league_id, name, is_current 
      FROM seasons 
      WHERE league_id = ANY($1) AND is_current = true
    `, [config.targetLeagueIds]);

    if (!seasonsResult.success) {
      throw new Error(`Error fetching seasons: ${seasonsResult.error}`);
    }

    const currentSeasons = seasonsResult.data || [];

    logs.push(`  Found ${currentSeasons?.length || 0} current seasons`);

    const allStandings: any[] = [];
    const processedSeasons = new Set<number>();

    // Fetch standings for each league
    for (const leagueId of config.targetLeagueIds || []) {
      try {
        logs.push(`Fetching standings for league ${leagueId}...`);
        
        const standingsData = await fetchAllPages(
          'https://api.sportmonks.com/v3/football/standings',
          { 
            filters: `standingLeagues:${leagueId}`,
            include: 'participant;league;season',
            per_page: 50,
            order: 'position:asc'
          }
        );
        
        apiCalls++;

        // Filter for current season if requested
        const filteredStandings = config.includeCurrentSeasonOnly 
          ? standingsData.filter((standing: any) => standing.season?.is_current)
          : standingsData;

        logs.push(`  League ${leagueId}: ${standingsData.length} total standings, ${filteredStandings.length} current season`);

        // Process standings data and ensure seasons exist
        const processedStandings = [];
        for (const standing of filteredStandings) {
          const seasonId = standing.season_id;
          const seasonData = standing.season;
          
          // Check if season exists, if not create it
          if (seasonData) {
            const seasonExists = await executeQuery(`
              SELECT id FROM seasons WHERE id = $1
            `, [seasonId]);
            
            if (!seasonExists.success || seasonExists.data?.length === 0) {
              // Create the season
              const createSeasonResult = await executeQuery(`
                INSERT INTO seasons (id, sport_id, league_id, name, finished, pending, is_current, starting_at, ending_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO NOTHING
              `, [
                seasonId,
                seasonData.sport_id,
                seasonData.league_id,
                seasonData.name,
                seasonData.finished,
                seasonData.pending,
                seasonData.is_current,
                seasonData.starting_at,
                seasonData.ending_at
              ]);
              
              if (createSeasonResult.success) {
                logs.push(`  Created season ${seasonId} (${seasonData.name})`);
                             } else {
                 const errorMsg = 'error' in createSeasonResult ? createSeasonResult.error : 'Unknown error';
                 logs.push(`  Warning: Failed to create season ${seasonId}: ${errorMsg}`);
                 continue; // Skip this standing if we can't create the season
               }
            }
          }
          
          processedSeasons.add(seasonId);
          
          processedStandings.push({
            id: standing.id,
            season_id: seasonId,
            team_id: standing.participant_id,
            position: standing.position,
            points: standing.points,
            // Note: The API response doesn't include played/won/drawn/lost/goals data
            // These would need to be calculated from fixtures or fetched separately
            played: null,
            won: null,
            drawn: null,
            lost: null,
            goals_for: null,
            goals_against: null,
            goal_difference: null
          });
        }

        allStandings.push(...processedStandings);

      } catch (error: any) {
        logs.push(`  Error fetching standings for league ${leagueId}: ${error.message}`);
      }
    }

    // Save standings to database
    logs.push('Saving standings to database...');
    
    if (allStandings.length > 0) {
      // First, delete existing standings for these seasons
      const seasonIds = Array.from(processedSeasons);
      const deleteResult = await executeQuery(`
        DELETE FROM standings WHERE season_id = ANY($1)
      `, [seasonIds]);

      if (!deleteResult.success) {
        const errorMsg = 'error' in deleteResult ? deleteResult.error : 'Unknown error';
        logs.push(`  Warning: Error deleting existing standings: ${errorMsg}`);
      } else {
        logs.push(`  Deleted existing standings for ${seasonIds.length} seasons`);
      }

      // Insert new standings
      const insertResult = await insertData('standings', allStandings);

      if (!insertResult.success) {
        const errorMsg = 'error' in insertResult ? insertResult.error : 'Unknown error';
        throw new Error(`Error inserting standings: ${errorMsg}`);
      }

      logs.push(`  Inserted ${allStandings.length} standings records`);
    }

    const duration = Date.now() - startTime;
    logs.push(`✅ Standings fetch completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Standings processed: ${allStandings.length}`);

    // Log operation
    await executeQuery(`
      INSERT INTO admin_operations (operation, success, api_calls, duration, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      'fetch_standings',
      true,
      apiCalls,
      `${duration}ms`,
      JSON.stringify({
        leagues_processed: config.targetLeagueIds?.length || 0,
        standings_count: allStandings.length,
        seasons_processed: processedSeasons.size,
        logs
      })
    ]);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      standingsCount: allStandings.length,
      seasonsProcessed: processedSeasons.size,
      logs
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ Error: ${error.message}`);

    // Log failed operation
    await executeQuery(`
      INSERT INTO admin_operations (operation, success, api_calls, duration, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      'fetch_standings',
      false,
      apiCalls,
      `${duration}ms`,
      JSON.stringify({ error: error.message, logs })
    ]);

    return NextResponse.json({
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      apiCalls,
      logs
    }, { status: 500 });
  }
} 