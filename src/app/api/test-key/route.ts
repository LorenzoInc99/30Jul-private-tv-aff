import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Testing service role key validity...');
    console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Service Key:', supabaseServiceKey ? `Set (${supabaseServiceKey.length} chars)` : 'Missing');
    console.log('Service Key starts with:', supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'N/A');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
    }

    // Test 1: Try to create a client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Client created successfully');
    
    // Test 2: Try to get project info (this should work with service role)
    const { data: projectData, error: projectError } = await supabase.auth.getUser();
    console.log('Project test:', { success: !projectError, error: projectError?.message });
    
    // Test 3: Try to access a simple table with minimal query
    const { data: simpleData, error: simpleError } = await supabase
      .from('states')
      .select('id')
      .limit(1);
    
    console.log('Simple query test:', { success: !simpleError, error: simpleError?.message });
    
    return NextResponse.json({
      success: true,
      tests: {
        clientCreation: { success: true },
        projectAccess: { success: !projectError, error: projectError?.message },
        tableAccess: { success: !simpleError, error: simpleError?.message }
      },
      serviceKeyInfo: {
        length: supabaseServiceKey.length,
        startsWith: supabaseServiceKey.substring(0, 20) + '...',
        isValidFormat: supabaseServiceKey.startsWith('eyJ')
      }
    });
    
  } catch (error) {
    console.error('Key test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 