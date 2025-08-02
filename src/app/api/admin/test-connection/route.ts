import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check if environment variables are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const apiToken = process.env.SPORTMONKS_API_TOKEN;

    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!apiToken) missingVars.push('SPORTMONKS_API_TOKEN');

    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables configured correctly',
      apiCalls: 0,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
        serviceKey: supabaseServiceKey ? 'Configured' : 'Missing',
        apiToken: apiToken ? 'Configured' : 'Missing'
      }
    });

  } catch (error) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      apiCalls: 0,
      duration,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 