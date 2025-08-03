import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

async function fetchData(url: string, params: Record<string, any> = {}) {
  if (!SPORTMONKS_API_TOKEN) {
    throw new Error('SPORTMONKS_API_TOKEN is not configured');
  }

  const fullParams = { api_token: SPORTMONKS_API_TOKEN, ...params };
  const queryString = new URLSearchParams(fullParams).toString();
  const fullUrl = `${url}?${queryString}`;
  
  console.log(`Fetching: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl);
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Response data keys: ${Object.keys(data)}`);
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

async function fetchAllPages(url: string, params: Record<string, any> = {}) {
  const allData = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const currentParams = { ...params, page };
      const data = await fetchData(url, currentParams);
      
      if (data.data && Array.isArray(data.data)) {
        allData.push(...data.data);
        console.log(`Page ${page}: Fetched ${data.data.length} items`);
      } else if (data.data) {
        allData.push(data.data);
        console.log(`Page ${page}: Fetched 1 item`);
      }
      
      // Check pagination
      if (data.pagination && data.pagination.has_more) {
        page++;
        hasMore = true;
      } else {
        hasMore = false;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
      break;
    }
  }
  
  return allData;
}

async function populateTable(supabase: any, tableName: string, data: any[], columns: string[]) {
  if (!data || data.length === 0) {
    console.log(`No data to populate for ${tableName}`);
    return;
  }

  console.log(`Populating ${tableName} with ${data.length} records...`);
  
  try {
    // Prepare data for insertion
    const insertData = data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        row[col] = item[col] || null;
      });
      return row;
    });

    console.log(`Prepared ${insertData.length} records for insertion`);
    console.log(`Sample record:`, insertData[0]);

    // Use upsert to handle conflicts
    const { error } = await supabase
      .from(tableName)
      .upsert(insertData, { onConflict: 'id' });

    if (error) {
      console.error(`Supabase error:`, error);
      throw error;
    }

    console.log(`Successfully populated ${tableName} with ${data.length} records`);
  } catch (error) {
    console.error(`Error populating ${tableName}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get bookmakers from database
    const { data: bookmakers, error } = await supabase
      .from('bookmakers')
      .select('id, name, url, image_path')
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      bookmakers: bookmakers || []
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      bookmakers: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCallCount = 0;
  
  try {
    console.log('🔄 Starting bookmakers update...');
    
    if (!SPORTMONKS_API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN is not configured');
    }

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Fetch bookmakers from Sportmonks API
    console.log('📊 Fetching bookmakers from Sportmonks API...');
    const bookmakersData = await fetchAllPages('https://api.sportmonks.com/v3/odds/bookmakers');
    apiCallCount = Math.ceil(bookmakersData.length / 25); // Estimate API calls based on pagination
    
    console.log(`✅ Fetched ${bookmakersData.length} bookmakers in ${apiCallCount} API calls`);
    console.log(`Sample bookmaker data:`, bookmakersData[0]);

    // Process bookmakers data to match database schema
    const processedBookmakers = bookmakersData.map((bookmaker: any) => ({
      id: bookmaker.id,
      name: bookmaker.name,
      url: bookmaker.url,
      image_path: bookmaker.image_path
    }));

    console.log(`Processed ${processedBookmakers.length} bookmakers`);
    console.log(`Sample processed bookmaker:`, processedBookmakers[0]);

    // Populate database with lowercase table name
    await populateTable(supabase, 'bookmakers', processedBookmakers, ['id', 'name', 'url', 'image_path']);

    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${processedBookmakers.length} bookmakers`,
      apiCalls: apiCallCount,
      duration,
      details: {
        bookmakersCount: processedBookmakers.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    console.error('Bookmakers update error:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      apiCalls: apiCallCount,
      duration,
      error: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
} 