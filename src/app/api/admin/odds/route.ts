import { NextRequest, NextResponse } from 'next/server';
import { insertData, executeQuery } from '@/lib/database';

interface OddsConfig {
  startDate?: string;
  endDate?: string;
  daysBack?: number;
  daysForward?: number;
  targetLeagueIds?: number[];
  bookmakerIds?: number[];
  marketId?: number;
  maxFixtures?: number;
  onlyFixturesWithOdds?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    const body = await request.json();
    const config: OddsConfig = {
      daysBack: 0,
      daysForward: 1,
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
      bookmakerIds: [2, 5, 6, 9, 12, 13, 16, 19, 20, 22, 23, 24], // UK bookmakers
      marketId: 1, // Match Winner (1X2)
      maxFixtures: 20,
      onlyFixturesWithOdds: false,
      ...body
    };

    // Calculate date range - today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = config.startDate || today.toISOString().split('T')[0];
    const endDate = config.endDate || tomorrow.toISOString().split('T')[0];      new Date(today.getTime() + (config.daysForward || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    logs.push(`Starting odds fetch with config:`);
    logs.push(`  Date range: ${startDate} to ${endDate}`);
    logs.push(`  Target leagues: ${config.targetLeagueIds?.length || 0} leagues`);
    logs.push(`  Bookmakers: ${config.bookmakerIds?.length || 0} bookmakers`);
    logs.push(`  Market ID: ${config.marketId} (Match Winner 1X2)`);
    logs.push(`  Max fixtures: ${config.maxFixtures}`);
    logs.push(`  Only fixtures with odds: ${config.onlyFixturesWithOdds}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    // Get fixtures that need odds
    logs.push('Getting fixtures that need odds...');
    const fixturesNeedingOdds = await getFixturesNeedingOdds(
      startDate, 
      endDate, 
      config.targetLeagueIds || [], 
      config.onlyFixturesWithOdds || false,
      config.maxFixtures || 100,
      logs
    );

    if (!fixturesNeedingOdds || fixturesNeedingOdds.length === 0) {
      logs.push('✅ No fixtures found in the specified date range');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        logs,
        results: {
          fixturesProcessed: 0,
          oddsInserted: 0,
          message: 'No fixtures found in date range'
        }
      });
    }

    logs.push(`Found ${fixturesNeedingOdds.length} fixtures to update odds`);

    // Fetch odds for fixtures
    logs.push('Fetching odds from SportMonks API...');
    const oddsData = await fetchOddsForFixtures(
      API_TOKEN,
      fixturesNeedingOdds,
      config.bookmakerIds || [],
      config.marketId || 1,
      logs
    );
    apiCalls += oddsData.apiCalls;

    // Save odds to database
    if (oddsData.data.length > 0) {
      logs.push('Saving odds to database...');
      await saveOddsToDatabase(oddsData.data, logs);
    }

    const duration = Date.now() - startTime;
    logs.push(`✅ Odds fetch completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Fixtures processed: ${fixturesNeedingOdds.length}`);
    logs.push(`  Odds records: ${oddsData.data.length}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        fixturesProcessed: fixturesNeedingOdds.length,
        oddsInserted: oddsData.data.length,
        bookmakersUsed: config.bookmakerIds?.length || 0,
        marketId: config.marketId
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

async function getFixturesNeedingOdds(
  startDate: string, 
  endDate: string, 
  targetLeagueIds: number[], 
  onlyFixturesWithOdds: boolean,
  maxFixtures: number,
  logs: string[]
) {
  const { executeQuery } = await import('@/lib/database');

  try {
    // Build the query
    let query = `
      SELECT id, name, starting_at, league_id, has_odds
      FROM fixtures
      WHERE starting_at >= $1 AND starting_at <= $2
      AND league_id = ANY($3)
    `;
    
    const params = [
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`,
      targetLeagueIds
    ];

    if (onlyFixturesWithOdds) {
      query += ` AND has_odds = true`;
    }

    query += ` ORDER BY starting_at ASC LIMIT $4`;
    params.push(maxFixtures);

    const result = await executeQuery(query, params);
    if (!result.success) throw new Error(result.error);

    const fixtures = result.data;

    // Always return all fixtures for odds update (odds change constantly)
    if (fixtures.length > 0) {
      const fixtureIds = fixtures.map(f => f.id);
      const oddsQuery = `
        SELECT DISTINCT fixture_id
        FROM odds
        WHERE fixture_id = ANY($1)
      `;
      
      const oddsResult = await executeQuery(oddsQuery, [fixtureIds]);
      if (!oddsResult.success) throw new Error(oddsResult.error);

      const fixturesWithOdds = new Set(oddsResult.data.map(o => o.fixture_id));
      const fixturesNeedingOdds = fixtures.filter(f => !fixturesWithOdds.has(f.id));

      logs.push(`  Total fixtures in date range: ${fixtures.length}`);
      logs.push(`  Fixtures with existing odds: ${fixturesWithOdds.size}`);
      logs.push(`  Fixtures needing new odds: ${fixturesNeedingOdds.length}`);
      logs.push(`  Fixtures to update existing odds: ${fixturesWithOdds.size}`);

      // Return ALL fixtures (both with and without existing odds) for updating
      return fixtures;
    }

    logs.push(`  No fixtures found in date range`);
    return [];

  } catch (error: any) {
    logs.push(`❌ Database error getting fixtures: ${error.message}`);
    throw error;
  }
}

async function fetchOddsForFixtures(
  apiToken: string,
  fixtures: any[],
  bookmakerIds: number[],
  marketId: number,
  logs: string[]
) {
  const allOdds = [];
  let apiCalls = 0;
  let fixturesWithOdds = 0;
  let fixturesWithoutOdds = 0;

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = fixtures[i];
    const fixtureId = fixture.id;
    const fixtureName = fixture.name;

    try {
      apiCalls++;

      // Use the specific odds endpoint for Match Winner market
      const url = `https://api.sportmonks.com/v3/football/odds/pre-match/fixtures/${fixtureId}`;
      const params = {
        api_token: apiToken,
        filters: `markets:${marketId}` // Only Match Winner market (Home/Draw/Away)
      };

      const response = await fetch(`${url}?${new URLSearchParams(params)}`);

      if (response.status === 404) {
        logs.push(`  ⚠️ Fixture ${fixtureId}: No odds endpoint available`);
        fixturesWithoutOdds++;
        continue;
      } else if (!response.ok) {
        logs.push(`  ❌ Fixture ${fixtureId}: HTTP ${response.status}`);
        fixturesWithoutOdds++;
        continue;
      }

      const data = await response.json();

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Filter to only specified bookmakers AND Home, Draw, Away labels
        const filteredOdds = [];
        const bookmakerCounts: { [key: number]: number } = {};

        for (const odd of data.data) {
          const bookmakerId = odd.bookmaker_id;
          const label = (odd.label || '').toLowerCase();

          // Only include specified bookmakers with Home/Draw/Away labels
          if (bookmakerIds.includes(bookmakerId) && ['home', 'draw', 'away'].includes(label)) {
            odd.fixture_id = fixtureId;
            filteredOdds.push(odd);
            bookmakerCounts[bookmakerId] = (bookmakerCounts[bookmakerId] || 0) + 1;
          }
        }

        if (filteredOdds.length > 0) {
          allOdds.push(...filteredOdds);
          fixturesWithOdds++;

          // Log which bookmakers provided odds
          const bookmakerNames = Object.entries(bookmakerCounts).map(([id, count]) => 
            `Bookmaker ${id}(${count})`
          );

          logs.push(`  ✅ Fixture ${fixtureId}: ${filteredOdds.length} odds from ${Object.keys(bookmakerCounts).length} bookmakers`);
        } else {
          fixturesWithoutOdds++;
          logs.push(`  ❌ Fixture ${fixtureId}: No matching bookmaker odds found`);
        }
      } else {
        fixturesWithoutOdds++;
        logs.push(`  ❌ Fixture ${fixtureId}: No odds data`);
      }

      // Show progress every 10 fixtures
      if ((i + 1) % 10 === 0) {
        logs.push(`  Progress: ${i + 1}/${fixtures.length} fixtures processed`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error: any) {
      fixturesWithoutOdds++;
      logs.push(`  ❌ Error fetching odds for fixture ${fixtureId}: ${error.message}`);
    }
  }

  logs.push(`  Fixtures with odds: ${fixturesWithOdds}`);
  logs.push(`  Fixtures without odds: ${fixturesWithoutOdds}`);
  logs.push(`  Total odds records: ${allOdds.length}`);

  return {
    data: allOdds,
    apiCalls
  };
}

function cleanProbabilityValue(probability: any) {
  if (probability === null || probability === undefined) {
    return null;
  }

  try {
    // Remove % and convert to float
    const probStr = String(probability).replace('%', '').trim();
    return parseFloat(probStr);
  } catch (error) {
    return null;
  }
}

async function saveOddsToDatabase(oddsData: any[], logs: string[]) {
  try {
    let updatedCount = 0;

    // Prepare odds data for batch upsert
    const oddsRecords = oddsData.map(odd => ({
      id: odd.id,
      fixture_id: odd.fixture_id,
      bookmaker_id: odd.bookmaker_id,
      market_id: odd.market_id,
      label: odd.label,
      value: odd.value,
      probability: cleanProbabilityValue(odd.probability),
      latest_bookmaker_update: odd.latest_bookmaker_update
    }));

    if (oddsRecords.length > 0) {
      // Use custom upsert query for odds table
      const columns = Object.keys(oddsRecords[0]);
      const placeholders = oddsRecords.map((_, rowIndex) => 
        `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
      ).join(', ');
      
      const updateClause = columns
        .filter(col => col !== 'id') // Don't update the ID
        .map(col => `${col} = EXCLUDED.${col}`)
        .join(', ');
      
      const query = `
        INSERT INTO odds (${columns.join(', ')}) 
        VALUES ${placeholders} 
        ON CONFLICT (id) DO UPDATE SET ${updateClause}
      `;
      
      const values = oddsRecords.flatMap(row => columns.map(col => row[col]));
      
      const result = await executeQuery(query, values);
      if (!result.success) throw new Error(result.error);
      
      updatedCount = oddsRecords.length;
      logs.push(`  Upserted ${updatedCount} odds records (inserted new + updated existing)`);
    }

  } catch (error: any) {
    logs.push(`❌ Database error saving odds: ${error.message}`);
    throw error;
  }
}