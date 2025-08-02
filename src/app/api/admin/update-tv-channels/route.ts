import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  let tvStationsUpdated = 0;
  
  try {
    const { startDate, endDate, tvStationIds = [] } = await request.json();
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // First, ensure TV stations table is populated
    apiCalls++;
    const tvStationsResponse = await fetchFromSportMonks('https://api.sportmonks.com/v3/football/tv-stations');
    
    // Handle different response structures
    const tvStationsData = tvStationsResponse.data || tvStationsResponse;
    const tvStationsArray = Array.isArray(tvStationsData) ? tvStationsData : [];
    
    if (tvStationsArray.length > 0) {
      await supabase
        .from('tvstations')
        .upsert(tvStationsArray.map((tv: any) => ({
          id: tv.id,
          name: tv.name,
          url: tv.url,
          image_path: tv.image_path
        })), { onConflict: 'id' });
    }
    
    // Get fixtures in the date range
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, league_id')
      .gte('starting_at', startDate)
      .lte('starting_at', endDate)
      .limit(100);
    
    if (fixturesError) {
      throw new Error(`Database error: ${fixturesError.message}`);
    }
    
    if (!fixtures || fixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fixtures found in the specified date range',
        apiCalls: 0,
        duration: '0s',
        timestamp: new Date().toISOString(),
        details: { fixturesUpdated: 0 }
      });
    }
    
        // Fetch TV channels for each fixture
    for (const fixture of fixtures) {
      try {
        apiCalls++;
        const oddsResponse = await fetchFromSportMonks(
          `https://api.sportmonks.com/v3/football/fixtures/${fixture.id}`,
          { include: 'tvstations' }
        );
        
        if (oddsResponse.data?.tvstations && Array.isArray(oddsResponse.data.tvstations)) {
          const tvRelationships = oddsResponse.data.tvstations;
          const fixtureTvData = [];

          for (const tvRel of tvRelationships) {
            // Access properties correctly - they might be nested differently
            const tvStationId = tvRel.tvstation_id || tvRel.tvstation?.id || tvRel.id;
            const countryId = tvRel.country_id || tvRel.country?.id || 1;

            // Filter by selected TV stations if specified
            if (tvStationIds.length === 0 || tvStationIds.includes(tvStationId)) {
              if (tvStationId && 1 <= tvStationId <= 10000) {
                const tvData = {
                  fixture_id: fixture.id,
                  tvstation_id: tvStationId,
                  country_id: countryId
                };
                fixtureTvData.push(tvData);
              }
            }
          }

          if (fixtureTvData.length > 0) {
            // Insert TV channel data
            const { error: tvError } = await supabase
              .from('fixturetvstations')
              .upsert(fixtureTvData, { onConflict: 'fixture_id,tvstation_id' });
           
            if (!tvError) {
              tvStationsUpdated += fixtureTvData.length;
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching TV channels for fixture ${fixture.id}:`, error);
      }
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated TV channels for ${fixtures.length} fixtures`,
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        fixturesProcessed: fixtures.length,
        tvStationsUpdated
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