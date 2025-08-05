import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing cron job setup...');
    
    // Test environment variables
    const envCheck = {
      hasCronSecret: !!process.env.CRON_SECRET,
      hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      hasApiToken: !!process.env.SPORTMONKS_API_TOKEN,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    };
    
    console.log('📋 Environment check:', envCheck);
    
    // Test the live-updates API call
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/live-updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxFixtures: 1 }) // Just test with 1 fixture
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job setup test completed',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      liveUpdatesTest: {
        status: response.status,
        success: result.success,
        message: result.results?.message || 'No message'
      }
    });

  } catch (error) {
    console.error('❌ Cron job test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Cron job test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 