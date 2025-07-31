import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY";
    
    // Test different countries endpoints
    const endpoints = [
      'https://api.sportmonks.com/v3/football/countries?api_token=' + API_TOKEN,
      'https://api.sportmonks.com/v3/football/countries/1?api_token=' + API_TOKEN, // Test single country
      'https://api.sportmonks.com/v3/football/countries?api_token=' + API_TOKEN + '&per_page=50&page=1', // With pagination
    ];

    const results = [];

    for (let i = 0; i < endpoints.length; i++) {
      try {
        console.log(`Testing endpoint ${i + 1}: ${endpoints[i]}`);
        const response = await fetch(endpoints[i]);
        const data = await response.json();
        
        results.push({
          endpoint: i + 1,
          url: endpoints[i],
          status: response.status,
          data: data
        });
      } catch (error) {
        results.push({
          endpoint: i + 1,
          url: endpoints[i],
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Countries API test results',
      results: results
    });

  } catch (error) {
    console.error('Error in test-countries:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 