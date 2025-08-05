import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, updateData } from '@/lib/database';

interface LeagueLogosConfig {
  targetLeagueIds?: number[];
  includeAllLeagues?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: LeagueLogosConfig = {
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
      includeAllLeagues: false,
      ...body
    };

    logs.push(`Starting league logos fetch with config:`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Include all leagues: ${config.includeAllLeagues}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    // Get leagues to process
    let leaguesToProcess: any[] = [];
    
    if (config.includeAllLeagues) {
      logs.push('Fetching all leagues from database...');
      const result = await executeQuery(
        'SELECT id, name FROM leagues ORDER BY name',
        []
      );
      
      if (!result.success) throw new Error(result.error);
      leaguesToProcess = result.data;
    } else {
      logs.push('Getting target leagues from database...');
      const result = await executeQuery(
        'SELECT id, name FROM leagues WHERE id = ANY($1) ORDER BY name',
        [config.targetLeagueIds || []]
      );
      
      if (!result.success) throw new Error(result.error);
      leaguesToProcess = result.data;
    }

    logs.push(`Found ${leaguesToProcess.length} leagues to process`);

    // Fetch and update league logos
    logs.push('Fetching league logos from SportMonks API...');
    const results = await fetchAndUpdateLeagueLogos(
      API_TOKEN,
      leaguesToProcess,
      logs
    );
    apiCalls += results.apiCalls;

    const duration = Date.now() - startTime;
    logs.push(`✅ League logos fetch completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Leagues processed: ${leaguesToProcess.length}`);
    logs.push(`  Logos updated: ${results.updatedCount}`);
    logs.push(`  Errors: ${results.errorsCount}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        leaguesProcessed: leaguesToProcess.length,
        logosUpdated: results.updatedCount,
        errors: results.errorsCount
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

async function fetchAndUpdateLeagueLogos(
  apiToken: string,
  leagues: any[],
  logs: string[]
) {
  let apiCalls = 0;
  let updatedCount = 0;
  let errorsCount = 0;
  const leaguesToUpdate: any[] = [];

  for (let i = 0; i < leagues.length; i++) {
    const league = leagues[i];
    const leagueId = league.id;
    const leagueName = league.name;

    logs.push(`Processing league ${i + 1}/${leagues.length}: ${leagueName} (ID: ${leagueId})`);

    try {
      apiCalls++;

      // Fetch league data from API
      const url = `https://api.sportmonks.com/v3/football/leagues/${leagueId}`;
      const params = { api_token: apiToken };
      const response = await fetch(`${url}?${new URLSearchParams(params)}`);

      if (!response.ok) {
        logs.push(`  ❌ Error fetching league ${leagueId}: HTTP ${response.status}`);
        errorsCount++;
        continue;
      }

      const data = await response.json();
      
      if (data.data && data.data.image_path) {
        const imagePath = data.data.image_path;
        const leagueName = data.data.name;

        // Prepare league update
        leaguesToUpdate.push({
          id: leagueId,
          league_logo: imagePath
        });

        updatedCount++;
        logs.push(`  ✅ Found logo for ${leagueName} (ID: ${leagueId})`);
        logs.push(`     Logo: ${imagePath}`);
      } else {
        logs.push(`  ⚠️ League ${leagueName} (ID: ${leagueId}) has no logo`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      errorsCount++;
      logs.push(`  ❌ Failed to fetch league ${leagueId}: ${error.message}`);
    }
  }

  // Update leagues with logos one by one
  if (leaguesToUpdate.length > 0) {
    for (const league of leaguesToUpdate) {
      try {
        const result = await executeQuery(
          'UPDATE leagues SET league_logo = $1 WHERE id = $2',
          [league.league_logo, league.id]
        );
        
        if (!result.success) {
          logs.push(`  ❌ Error updating league ${league.id}: ${result.error}`);
          errorsCount++;
          updatedCount--;
        }
      } catch (error: any) {
        logs.push(`  ❌ Error updating league ${league.id}: ${error.message}`);
        errorsCount++;
        updatedCount--;
      }
    }
    
    if (updatedCount > 0) {
      logs.push(`  ✅ Successfully updated ${updatedCount} league logos`);
    }
  }

  return {
    apiCalls,
    updatedCount,
    errorsCount
  };
} 