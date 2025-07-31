import { NextRequest, NextResponse } from 'next/server';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

async function testEndpoint(url: string, description: string) {
  try {
    const params = new URLSearchParams({ api_token: SPORTMONKS_API_TOKEN! });
    const fullUrl = `${url}?${params}`;
    
    console.log(`Testing ${description}: ${url}`);
    
    const response = await fetch(fullUrl);
    const responseText = await response.text();
    
    return {
      url,
      description,
      status: response.status,
      success: response.ok,
      data: response.ok ? JSON.parse(responseText) : responseText
    };
  } catch (error) {
    return {
      url,
      description,
      status: 'ERROR',
      success: false,
      data: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!SPORTMONKS_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'SPORTMONKS_API_TOKEN is not configured' },
        { status: 400 }
      );
    }

    console.log('Testing SportMonks API connection...');
    
    // Test different endpoint variations
    const endpoints = [
      { url: 'https://api.sportmonks.com/v3/football/countries', desc: 'Countries v3' },
      { url: 'https://api.sportmonks.com/v3/core/countries', desc: 'Countries core' },
      { url: 'https://api.sportmonks.com/v3/football/leagues', desc: 'Leagues' },
      { url: 'https://api.sportmonks.com/v3/football/teams', desc: 'Teams' },
      { url: 'https://api.sportmonks.com/v3/odds/bookmakers', desc: 'Bookmakers' },
      { url: 'https://api.sportmonks.com/v3/football/tv-stations', desc: 'TV Stations' },
      { url: 'https://api.sportmonks.com/v3/football/fixtures/latest', desc: 'Latest Fixtures' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.url, endpoint.desc);
      results.push(result);
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Find successful endpoints
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return NextResponse.json({
      success: successful.length > 0,
      message: successful.length > 0 ? 'Some endpoints are working' : 'All endpoints failed',
      successful: successful.map(r => ({ url: r.url, description: r.description, status: r.status })),
      failed: failed.map(r => ({ url: r.url, description: r.description, status: r.status, error: r.data })),
      allResults: results
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 