import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY";
    
    // Test leagues endpoint to see if it includes country information
    const url = `https://api.sportmonks.com/v3/football/leagues?api_token=${API_TOKEN}&include=country&per_page=10&page=1`;
    
    console.log('Testing leagues endpoint with country include:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json({
      message: 'Leagues with country data test',
      status: response.status,
      url: url,
      data: data
    });

  } catch (error) {
    console.error('Error in test-league-countries:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 