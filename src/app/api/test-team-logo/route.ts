import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId') || '1'; // Default to team ID 1 for testing
    const apiToken = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY";

    console.log(`Testing team logo retrieval for team ID: ${teamId}`);

    // Test the SportMonks team endpoint
    const url = `https://api.sportmonks.com/v3/football/teams/${teamId}`;
    const params = {
      api_token: apiToken,
      include: "image" // Try to include image data
    };

    console.log('Making request to:', url);
    console.log('With params:', params);

    const response = await fetch(`${url}?${new URLSearchParams(params)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Extract logo information
    let logoInfo = {
      teamId: teamId,
      teamName: data.data?.name || 'Unknown',
      logoUrl: null,
      imageData: null,
      availableFields: Object.keys(data.data || {})
    };

    // Check different possible logo fields
    if (data.data?.image_path) {
      logoInfo.logoUrl = data.data.image_path;
    } else if (data.data?.image) {
      logoInfo.imageData = data.data.image;
    } else if (data.data?.logo) {
      logoInfo.logoUrl = data.data.logo;
    } else if (data.data?.image_url) {
      logoInfo.logoUrl = data.data.image_url;
    }

    // Also check if there's an image object in the response
    if (data.data?.image && typeof data.data.image === 'object') {
      logoInfo.imageData = data.data.image;
    }

    return NextResponse.json({
      success: true,
      teamInfo: logoInfo,
      fullResponse: data,
      testUrl: `${url}?${new URLSearchParams(params)}`
    });

  } catch (error) {
    console.error('Error testing team logo:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      teamId: searchParams.get('teamId') || '1'
    }, { status: 500 });
  }
} 