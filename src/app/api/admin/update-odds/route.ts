import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

// UK Bookmakers (default selection)
const DEFAULT_UK_BOOKMAKER_IDS = [2, 5, 6, 9, 12, 13, 16, 19, 20, 22, 23, 24];

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

function cleanProbabilityValue(probability: any): number | null {
  if (probability === null || probability === undefined) {
    return null;
  }
  
  const probStr = String(probability).replace('%', '').trim();
  
  try {
    return parseFloat(probStr);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  let totalOdds = 0;
  let fixturesWithOdds = 0;
  
  try {
    const { startDate, endDate, bookmakerIds = DEFAULT_UK_BOOKMAKER_IDS } = await request.json();
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // Get fixtures in the date range that have odds available
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, name, starting_at')
      .gte('starting_at', startDate)
      .lte('starting_at', endDate)
      .eq('has_odds', true)
      .limit(50); // Limit to avoid overwhelming the API
    
    if (fixturesError) {
      throw new Error(`Database error: ${fixturesError.message}`);
    }
    
    if (!fixtures || fixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fixtures with odds found in the specified date range',
        apiCalls: 0,
        duration: '0s',
        timestamp: new Date().toISOString(),
        details: { fixturesProcessed: 0, oddsInserted: 0 }
      });
    }
    
    // Ensure bookmakers exist
    apiCalls++;
    const bookmakersResponse = await fetchFromSportMonks('https://api.sportmonks.com/v3/odds/bookmakers');
    const bookmakers = Array.isArray(bookmakersResponse.data) ? bookmakersResponse.data : [bookmakersResponse.data];
    
    await supabase
      .from('bookmakers')
      .upsert(bookmakers.map((bm: any) => ({
        id: bm.id,
        name: bm.name,
        url: bm.url,
        image_path: bm.image_path
      })), { onConflict: 'id' });
    
    // Fetch odds for each fixture
    for (const fixture of fixtures) {
      try {
        apiCalls++;
        const oddsResponse = await fetchFromSportMonks(
          `https://api.sportmonks.com/v3/football/fixtures/${fixture.id}`,
          { include: 'odds' }
        );
        
        if (oddsResponse.data?.odds && Array.isArray(oddsResponse.data.odds)) {
          const odds = oddsResponse.data.odds;
          
          // Filter to only selected bookmakers and 1X2 market (market_id: 1)
          const filteredOdds = odds.filter((odd: any) => 
            bookmakerIds.includes(odd.bookmaker_id) && 
            odd.market_id === 1 && 
            ['home', 'draw', 'away'].includes(odd.label?.toLowerCase())
          );
          
          // Process and insert odds
          const processedOdds = filteredOdds.map((odd: any) => ({
            id: odd.id,
            fixture_id: odd.fixture_id,
            market_id: odd.market_id,
            bookmaker_id: odd.bookmaker_id,
            label: odd.label,
            value: odd.value,
            name: odd.name,
            sort_order: odd.sort_order,
            market_description: odd.market_description,
            probability: cleanProbabilityValue(odd.probability),
            dp3: odd.dp3,
            fractional: odd.fractional,
            american: odd.american,
            winning: odd.winning,
            stopped: odd.stopped,
            total: odd.total,
            handicap: odd.handicap,
            participants: odd.participants,
            created_at: odd.created_at,
            original_label: odd.original_label,
            latest_bookmaker_update: odd.latest_bookmaker_update
          }));
          
          if (processedOdds.length > 0) {
            const { error: oddsError } = await supabase
              .from('odds')
              .upsert(processedOdds, { onConflict: 'id' });
            
            if (oddsError) {
              console.error(`Error inserting odds for fixture ${fixture.id}:`, oddsError);
            } else {
              totalOdds += processedOdds.length;
              fixturesWithOdds++;
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching odds for fixture ${fixture.id}:`, error);
      }
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated odds for ${fixturesWithOdds} fixtures`,
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        fixturesProcessed: fixtures.length,
        fixturesWithOdds,
        oddsInserted: totalOdds,
        bookmakersUsed: bookmakerIds
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