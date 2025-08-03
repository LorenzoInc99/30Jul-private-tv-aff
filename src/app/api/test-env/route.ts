import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check if all variables are present
    const hasUrl = !!supabaseUrl;
    const hasAnonKey = !!supabaseAnonKey;
    const hasServiceKey = !!supabaseServiceKey;
    
    // Validate URL format
    const isValidUrl = hasUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
    
    // Validate key formats
    const isValidAnonKey = hasAnonKey && supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 100;
    const isValidServiceKey = hasServiceKey && supabaseServiceKey.startsWith('eyJ') && supabaseServiceKey.length > 100;
    
    // Extract project ID from URL
    const projectId = hasUrl ? supabaseUrl.split('//')[1]?.split('.')[0] : null;
    
    return NextResponse.json({
      success: hasUrl && hasAnonKey && hasServiceKey,
      environment: {
        hasUrl,
        hasAnonKey,
        hasServiceKey,
        isValidUrl,
        isValidAnonKey,
        isValidServiceKey,
        projectId,
        url: hasUrl ? supabaseUrl : null,
        anonKeyLength: hasAnonKey ? supabaseAnonKey.length : 0,
        serviceKeyLength: hasServiceKey ? supabaseServiceKey.length : 0,
        anonKeyStart: hasAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : null,
        serviceKeyStart: hasServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : null
      },
      message: 'Environment variables check completed'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 