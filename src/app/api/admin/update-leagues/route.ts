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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    apiCalls++;
    const leaguesData = await fetchAllPages('https://api.sportmonks.com/v3/football/leagues');
    
    // Only include fields that exist in your leagues table
    const processedLeagues = leaguesData.map((league: any) => ({
      id: league.id,
      name: league.name,
      sport_id: league.sport_id,
      country_id: league.country_id,
      league_logo: league.image_path // Map image_path to league_logo
    }));
    
    const { error } = await supabase
      .from('leagues')
      .upsert(processedLeagues, { onConflict: 'id' });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${processedLeagues.length} leagues`,
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        leaguesUpdated: processedLeagues.length
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