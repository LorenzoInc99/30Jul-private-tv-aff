import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface LiveUpdatesConfig {
  targetLeagueIds?: number[];
  maxFixtures?: number;
  updateScores?: boolean;
  updateStatus?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: LiveUpdatesConfig = {
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
      maxFixtures: 50,
      updateScores: true,
      updateStatus: true,
      ...body
    };

    logs.push(`Starting live updates with config:`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Max fixtures: ${config.maxFixtures}`);
    logs.push(`  Update scores: ${config.updateScores}`);
    logs.push(`  Update status: ${config.updateStatus}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    // Get live and recent fixtures
    logs.push('Getting live and recent fixtures...');
    const fixturesToUpdate = await getFixturesToUpdate(
      config.targetLeagueIds,
      config.maxFixtures,
      logs
    );

    if (fixturesToUpdate.length === 0) {
      logs.push('✅ No fixtures need live updates!');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        logs,
        results: {
          fixturesProcessed: 0,
          updatesApplied: 0,
          message: 'No fixtures need live updates'
        }
      });
    }

    logs.push(`Found ${fixturesToUpdate.length} fixtures to update`);

    // Update fixtures
    logs.push('Updating fixtures from SportMonks API...');
    const results = await updateFixtures(
      API_TOKEN,
      fixturesToUpdate,
      config.updateScores,
      config.updateStatus,
      logs
    );
    apiCalls += results.apiCalls;

    const duration = Date.now() - startTime;
    logs.push(`✅ Live updates completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Fixtures processed: ${fixturesToUpdate.length}`);
    logs.push(`  Updates applied: ${results.updatesApplied}`);
    logs.push(`  Errors: ${results.errorsCount}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        fixturesProcessed: fixturesToUpdate.length,
        updatesApplied: results.updatesApplied,
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

async function getFixturesToUpdate(
  targetLeagueIds: number[],
  maxFixtures: number,
  logs: string[]
) {
  try {
    // Get fixtures that are live, scheduled for today, or finished recently
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const query = `
      SELECT id, name, starting_at, state_id, home_score, away_score, league_id
      FROM fixtures
      WHERE league_id = ANY($1)
      AND starting_at >= $2
      AND starting_at <= $3
      ORDER BY starting_at ASC
      LIMIT $4
    `;

    const params = [
      targetLeagueIds,
      startOfDay.toISOString(),
      endOfDay.toISOString(),
      maxFixtures
    ];

    const result = await executeQuery(query, params);
    if (!result.success) throw new Error(result.error);

    logs.push(`  Found ${result.data.length} fixtures for today`);

    return result.data;

  } catch (error: any) {
    logs.push(`❌ Database error getting fixtures: ${error.message}`);
    throw error;
  }
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

async function updateFixtures(
  apiToken: string,
  fixtures: any[],
  updateScores: boolean,
  updateStatus: boolean,
  logs: string[]
) {
  let apiCalls = 0;
  let updatesApplied = 0;
  let errorsCount = 0;

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = fixtures[i];
    const fixtureId = fixture.id;
    const fixtureName = fixture.name;

    try {
      apiCalls++;

      // Fetch latest fixture data from API
      const url = `https://api.sportmonks.com/v3/football/fixtures/${fixtureId}`;
      const params = {
        api_token: apiToken,
        include: 'scores;participants'
      };

      const response = await fetch(`${url}?${new URLSearchParams(params)}`);

      if (!response.ok) {
        logs.push(`  ❌ Error fetching fixture ${fixtureId}: HTTP ${response.status}`);
        errorsCount++;
        continue;
      }

      const data = await response.json();
      
      if (!data.data) {
        logs.push(`  ❌ No data for fixture ${fixtureId}`);
        errorsCount++;
        continue;
      }

      const fixtureData = data.data;
      let hasUpdates = false;
      const updateData: any = {};

      // Update status if requested
      if (updateStatus && fixtureData.state_id !== fixture.state_id) {
        updateData.state_id = fixtureData.state_id;
        hasUpdates = true;
        logs.push(`  📊 Status update for ${fixtureName}: ${fixture.state_id} → ${fixtureData.state_id}`);
      }

      // Update scores if requested
      if (updateScores) {
        const { homeScore, awayScore } = extractScoresFromFixture(fixtureData);
        
        if (homeScore !== fixture.home_score || awayScore !== fixture.away_score) {
          updateData.home_score = homeScore;
          updateData.away_score = awayScore;
          hasUpdates = true;
          logs.push(`  ⚽ Score update for ${fixtureName}: ${fixture.home_score}-${fixture.away_score} → ${homeScore}-${awayScore}`);
        }
      }

      // Update database if there are changes
      if (hasUpdates) {
        const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const query = `UPDATE fixtures SET ${setClause} WHERE id = $1`;
        const params = [fixtureId, ...Object.values(updateData)];
        
        const result = await executeQuery(query, params);

        if (!result.success) {
          logs.push(`  ❌ Error updating fixture ${fixtureId}: ${result.error}`);
          errorsCount++;
        } else {
          updatesApplied++;
          logs.push(`  ✅ Updated ${fixtureName} (ID: ${fixtureId})`);
        }
      } else {
        logs.push(`  ℹ️ No updates needed for ${fixtureName} (ID: ${fixtureId})`);
      }

      // Show progress every 10 fixtures
      if ((i + 1) % 10 === 0) {
        logs.push(`  Progress: ${i + 1}/${fixtures.length} fixtures processed`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error: any) {
      errorsCount++;
      logs.push(`  ❌ Failed to update fixture ${fixtureId}: ${error.message}`);
    }
  }

  return {
    apiCalls,
    updatesApplied,
    errorsCount
  };
} 