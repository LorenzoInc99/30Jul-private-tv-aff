import { NextRequest, NextResponse } from 'next/server';
import { insertData } from '@/lib/database';

interface TvChannelsConfig {
  startDate?: string;
  endDate?: string;
  daysBack?: number;
  daysForward?: number;
  targetLeagueIds?: number[];
  maxFixtures?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: TvChannelsConfig = {
      daysBack: 0, // Today
      daysForward: 3, // Next 3 days
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
      ...body
    };

    // Calculate date range
    const today = new Date();
    const startDate = config.startDate || 
      new Date(today.getTime() + (config.daysBack || 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = config.endDate || 
      new Date(today.getTime() + (config.daysForward || 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    logs.push(`Starting TV channels fetch with config:`);
    logs.push(`  Date range: ${startDate} to ${endDate}`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Max fixtures: ${config.maxFixtures}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    // Get fixtures that need TV channels
    logs.push('Getting fixtures that need TV channels...');
    const fixturesNeedingTv = await getFixturesNeedingTvChannels(
      startDate, 
      endDate, 
      config.targetLeagueIds, 
      config.maxFixtures,
      logs
    );

    if (fixturesNeedingTv.length === 0) {
      logs.push('✅ No fixtures need TV channel data!');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        logs,
        results: {
          fixturesProcessed: 0,
          tvChannelsInserted: 0,
          message: 'No fixtures need TV channel data'
        }
      });
    }

    logs.push(`Found ${fixturesNeedingTv.length} fixtures needing TV channels`);

    // Fetch TV channels for fixtures
    logs.push('Fetching TV channels from SportMonks API...');
    const tvData = await fetchTvChannelsForFixtures(
      API_TOKEN,
      fixturesNeedingTv,
      logs
    );
    apiCalls += tvData.apiCalls;

    // Save TV channels to database
    if (tvData.data.length > 0) {
      logs.push('Saving TV channels to database...');
      await saveTvChannelsToDatabase(tvData.data, logs);
    }

    const duration = Date.now() - startTime;
    logs.push(`✅ TV channels fetch completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Fixtures processed: ${fixturesNeedingTv.length}`);
    logs.push(`  TV channel records: ${tvData.data.length}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        fixturesProcessed: fixturesNeedingTv.length,
        tvChannelsInserted: tvData.data.length,
        dateRange: { startDate, endDate }
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

async function getFixturesNeedingTvChannels(
  startDate: string, 
  endDate: string, 
  targetLeagueIds: number[], 
  maxFixtures: number,
  logs: string[]
) {
  const { executeQuery } = await import('@/lib/database');

  try {
    // Get fixtures in date range
    const query = `
      SELECT id, name, starting_at, league_id
      FROM fixtures
      WHERE starting_at >= $1 AND starting_at <= $2
      AND league_id = ANY($3)
      ORDER BY starting_at ASC
      LIMIT $4
    `;
    
    const params = [
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`,
      targetLeagueIds,
      maxFixtures
    ];

    const result = await executeQuery(query, params);
    if (!result.success) throw new Error(result.error);

    const fixtures = result.data;

    // Check which fixtures already have TV channels
    if (fixtures.length > 0) {
      const fixtureIds = fixtures.map(f => f.id);
      const tvQuery = `
        SELECT DISTINCT fixture_id
        FROM fixturetvstations
        WHERE fixture_id = ANY($1)
      `;
      
      const tvResult = await executeQuery(tvQuery, [fixtureIds]);
      if (!tvResult.success) throw new Error(tvResult.error);

      const fixturesWithTv = new Set(tvResult.data.map(t => t.fixture_id));
      const fixturesNeedingTv = fixtures.filter(f => !fixturesWithTv.has(f.id));

      logs.push(`  Total fixtures in date range: ${fixtures.length}`);
      logs.push(`  Fixtures with existing TV channels: ${fixturesWithTv.size}`);
      logs.push(`  Fixtures needing TV channels: ${fixturesNeedingTv.length}`);

      return fixturesNeedingTv;
    }

    logs.push(`  No fixtures found in date range`);
    return [];

  } catch (error: any) {
    logs.push(`❌ Database error getting fixtures: ${error.message}`);
    throw error;
  }
}

async function fetchTvChannelsForFixtures(
  apiToken: string,
  fixtures: any[],
  logs: string[]
) {
  const allTvData = [];
  let apiCalls = 0;
  let fixturesWithTv = 0;
  let fixturesWithoutTv = 0;
  let validTvStations = 0;

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = fixtures[i];
    const fixtureId = fixture.id;
    const fixtureName = fixture.name;

    try {
      apiCalls++;

      const url = `https://api.sportmonks.com/v3/football/fixtures/${fixtureId}`;
      const params = {
        api_token: apiToken,
        include: 'tvstations'
      };

      const response = await fetch(`${url}?${new URLSearchParams(params)}`);

      if (response.status === 404) {
        logs.push(`  ⚠️ Fixture ${fixtureId}: No fixture found`);
        fixturesWithoutTv++;
        continue;
      } else if (!response.ok) {
        logs.push(`  ❌ Fixture ${fixtureId}: HTTP ${response.status}`);
        fixturesWithoutTv++;
        continue;
      }

      const data = await response.json();

      if (data.data) {
        const fixtureData = data.data;
        const tvRelationships = fixtureData.tvstations || [];

        if (tvRelationships.length > 0) {
          const fixtureTvData = [];

          for (const tvRel of tvRelationships) {
            const tvStationId = tvRel.tvstation_id;
            const countryId = tvRel.country_id || 1;

            if (tvStationId && tvStationId >= 1 && tvStationId <= 10000) {
              const tvData = {
                fixture_id: fixtureId,
                tvstation_id: tvStationId,
                country_id: countryId
              };
              fixtureTvData.push(tvData);
              validTvStations++;
            }
          }

          if (fixtureTvData.length > 0) {
            allTvData.push(...fixtureTvData);
            fixturesWithTv++;
            logs.push(`  ✅ Fixture ${fixtureId}: ${fixtureTvData.length} TV channels`);
          } else {
            fixturesWithoutTv++;
            logs.push(`  ❌ Fixture ${fixtureId}: No valid TV channels`);
          }
        } else {
          fixturesWithoutTv++;
          logs.push(`  ❌ Fixture ${fixtureId}: No TV relationships`);
        }
      } else {
        fixturesWithoutTv++;
        logs.push(`  ❌ Fixture ${fixtureId}: No fixture data`);
      }

      // Show progress every 5 fixtures
      if ((i + 1) % 5 === 0) {
        logs.push(`  Progress: ${i + 1}/${fixtures.length} fixtures processed`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error: any) {
      fixturesWithoutTv++;
      logs.push(`  ❌ Error fetching TV channels for fixture ${fixtureId}: ${error.message}`);
    }
  }

  logs.push(`  Fixtures with TV channels: ${fixturesWithTv}`);
  logs.push(`  Fixtures without TV channels: ${fixturesWithoutTv}`);
  logs.push(`  Total TV channel records: ${allTvData.length}`);

  return {
    data: allTvData,
    apiCalls
  };
}

async function saveTvChannelsToDatabase(tvData: any[], logs: string[]) {
  try {
    let insertedCount = 0;

    if (tvData.length > 0) {
      const result = await insertData('fixturetvstations', tvData);
      if (!result.success) throw new Error(result.error);
      
      insertedCount = tvData.length;
      logs.push(`  Inserted ${insertedCount} TV channel records`);
    }

  } catch (error: any) {
    logs.push(`❌ Database error saving TV channels: ${error.message}`);
    throw error;
  }
} 