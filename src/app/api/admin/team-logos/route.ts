import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface TeamLogosConfig {
  targetLeagueIds?: number[];
  includeAllTeams?: boolean;
  maxTeams?: number;
  batchSize?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: TeamLogosConfig = {
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
      includeAllTeams: false,
      maxTeams: 500,
      batchSize: 20,
      ...body
    };

    logs.push(`Starting team logos fetch with config:`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Include all teams: ${config.includeAllTeams}`);
    logs.push(`  Max teams: ${config.maxTeams}`);
    logs.push(`  Batch size: ${config.batchSize}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    // Get teams that need logos
    logs.push('Getting teams that need logos...');
    const teamsNeedingLogos = await getTeamsNeedingLogos(
      config.targetLeagueIds,
      config.includeAllTeams,
      config.maxTeams,
      logs
    );

    if (teamsNeedingLogos.length === 0) {
      logs.push('✅ All teams already have logo URLs!');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        logs,
        results: {
          teamsProcessed: 0,
          logosUpdated: 0,
          message: 'All teams already have logo URLs'
        }
      });
    }

    logs.push(`Found ${teamsNeedingLogos.length} teams needing logos`);

    // Fetch and update team logos
    logs.push('Fetching team logos from SportMonks API...');
    const results = await fetchAndUpdateTeamLogos(
      API_TOKEN,
      teamsNeedingLogos,
      config.batchSize || 20,
      logs
    );
    apiCalls += results.apiCalls;

    const duration = Date.now() - startTime;
    logs.push(`✅ Team logos fetch completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Teams processed: ${teamsNeedingLogos.length}`);
    logs.push(`  Logos updated: ${results.updatedCount}`);
    logs.push(`  Errors: ${results.errorsCount}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        teamsProcessed: teamsNeedingLogos.length,
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

async function getTeamsNeedingLogos(
  targetLeagueIds: number[],
  includeAllTeams: boolean,
  maxTeams: number,
  logs: string[]
) {
  try {
    let query: string;
    let params: any[] = [];

    if (!includeAllTeams && targetLeagueIds.length > 0) {
      // Get teams from target leagues that need logos
      query = `
        SELECT DISTINCT t.id, t.name, t.short_code, t.country_id
        FROM teams_new t
        INNER JOIN fixtures f ON t.id = f.home_team_id OR t.id = f.away_team_id
        WHERE f.league_id = ANY($1)
        AND (t.team_logo_url IS NULL OR t.team_logo_url = '' OR t.team_logo_url LIKE '%placeholder%')
        ORDER BY t.name
        LIMIT $2
      `;
      params = [targetLeagueIds, maxTeams];
    } else {
      // Get all teams that need logos
      query = `
        SELECT id, name, short_code, country_id
        FROM teams_new
        WHERE team_logo_url IS NULL OR team_logo_url = '' OR team_logo_url LIKE '%placeholder%'
        ORDER BY name
        LIMIT $1
      `;
      params = [maxTeams];
    }

    const result = await executeQuery(query, params);
    if (!result.success) throw new Error(result.error);

    logs.push(`  Total teams needing logos: ${result.data.length}`);

    return result.data;

  } catch (error: any) {
    logs.push(`❌ Database error getting teams: ${error.message}`);
    throw error;
  }
}

function isValidLogoUrl(logoUrl: string | null) {
  if (!logoUrl) return false;

  const placeholderIndicators = [
    'placeholder', 'default', 'generic', 'unknown', 'team_placeholder'
  ];

  const logoUrlLower = logoUrl.toLowerCase();
  for (const indicator of placeholderIndicators) {
    if (logoUrlLower.includes(indicator)) {
      return false;
    }
  }

  return logoUrl.startsWith('http');
}

async function fetchAndUpdateTeamLogos(
  apiToken: string,
  teams: any[],
  batchSize: number,
  logs: string[]
) {
  let apiCalls = 0;
  let updatedCount = 0;
  let errorsCount = 0;

  // Process teams in batches
  for (let batchStart = 0; batchStart < teams.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, teams.length);
    const batch = teams.slice(batchStart, batchEnd);
    const batchNum = Math.floor(batchStart / batchSize) + 1;
    const totalBatches = Math.ceil(teams.length / batchSize);

    logs.push(`Processing batch ${batchNum}/${totalBatches} (${batch.length} teams)`);

    // Process batch concurrently
    const batchPromises = batch.map(async (team) => {
      const teamId = team.id;
      const teamName = team.name;

      try {
        apiCalls++;

        // Try to get logo URL from the team data first
        let logoUrl = null;
        const logoFields = ['image_path', 'logo_path', 'team_logo_url', 'logo_url'];

        // If no logo found in team data, fetch individual team details
        if (!logoUrl) {
          const url = `https://api.sportmonks.com/v3/football/teams/${teamId}`;
          const params = { api_token: apiToken };
          const response = await fetch(`${url}?${new URLSearchParams(params)}`);

          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              const teamDetail = data.data;

              // Look for logo in team detail
              for (const field of logoFields) {
                if (teamDetail[field]) {
                  const potentialLogo = teamDetail[field];
                  if (isValidLogoUrl(potentialLogo)) {
                    logoUrl = potentialLogo;
                    break;
                  }
                }
              }
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Update team logo in database if found
        if (logoUrl) {
          const result = await executeQuery(
            'UPDATE teams_new SET team_logo_url = $1 WHERE id = $2',
            [logoUrl, teamId]
          );

          if (!result.success) {
            logs.push(`  ❌ Error updating team ${teamId}: ${result.error}`);
            return { success: false, error: result.error };
          } else {
            logs.push(`  ✅ Updated logo for ${teamName} (ID: ${teamId})`);
            return { success: true, logoUrl };
          }
        } else {
          logs.push(`  ⚠️ No valid logo found for ${teamName} (ID: ${teamId})`);
          return { success: false, error: 'No valid logo found' };
        }

      } catch (error: any) {
        logs.push(`  ❌ Failed to fetch team ${teamId}: ${error.message}`);
        return { success: false, error: error.message };
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Count results
    for (const result of batchResults) {
      if (result.success) {
        updatedCount++;
      } else {
        errorsCount++;
      }
    }

    logs.push(`  Batch ${batchNum} complete: ${batchResults.filter(r => r.success).length} updated, ${batchResults.filter(r => !r.success).length} errors`);
  }

  return {
    apiCalls,
    updatedCount,
    errorsCount
  };
} 