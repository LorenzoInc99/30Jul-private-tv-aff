import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
    }

    console.log('Testing service role key...');
    
    // Create client with explicit service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    console.log('Service role client created');
    
    // Test 1: Try to access states table directly
    const { data: statesData, error: statesError } = await supabase
      .from('states')
      .select('*')
      .limit(1);
    
    console.log('States test:', { success: !statesError, data: statesData, error: statesError?.message });
    
    // Test 2: Try to access countries table
    const { data: countriesData, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(1);
    
    console.log('Countries test:', { success: !countriesError, data: countriesData, error: countriesError?.message });
    
    // Test 3: Try to access a table that might not have RLS
    const { data: testData, error: testError } = await supabase
      .from('test_connection')
      .select('*')
      .limit(1);
    
    console.log('Test connection test:', { success: !testError, data: testData, error: testError?.message });
    
    // Test 4: Try to get current user (should work with service role)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    console.log('User test:', { success: !userError, data: userData, error: userError?.message });
    
    return NextResponse.json({
      success: true,
      tests: {
        states: { success: !statesError, data: statesData, error: statesError?.message },
        countries: { success: !countriesError, data: countriesData, error: countriesError?.message },
        testConnection: { success: !testError, data: testData, error: testError?.message },
        user: { success: !userError, data: userData, error: userError?.message }
      },
      message: 'Service role tests completed'
    });
    
  } catch (error) {
    console.error('Service role test failed:', error);
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