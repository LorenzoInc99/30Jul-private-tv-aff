import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('❌ Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔄 Cron job: Starting live updates...');
    
    // Check if required environment variables are set
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.log('⚠️ NEXT_PUBLIC_BASE_URL not set, using localhost');
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`📡 Calling live updates API at: ${baseUrl}/api/admin/live-updates`);

    // Call the live-updates API to update all fixtures
    const response = await fetch(`${baseUrl}/api/admin/live-updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Empty body - API will handle all fixtures
    });
    
    console.log(`📊 Live updates API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Live updates API error: ${response.status} - ${errorText}`);
      throw new Error(`Live updates API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Live updates API result:`, result);
    
    console.log(`✅ Cron job completed: ${result.results?.message || 'Live updates processed'}`);
    
    return NextResponse.json({
      success: true,
      message: 'Live updates completed successfully',
      timestamp: new Date().toISOString(),
      apiResult: result
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json({ 
      error: 'Cron job failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 