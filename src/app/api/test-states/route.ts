import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const results: Record<string, any> = {};
    
    // Test 1: Try with service role key
    if (supabaseServiceKey && supabaseUrl) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      const { data: serviceData, error: serviceError } = await supabaseService
        .from('states')
        .select('*')
        .limit(1);
      
      results.serviceRole = {
        success: !serviceError,
        data: serviceData,
        error: serviceError?.message
      };
    }
    
    // Test 2: Try with anon key
    if (supabaseAnonKey && supabaseUrl) {
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
      const { data: anonData, error: anonError } = await supabaseAnon
        .from('states')
        .select('*')
        .limit(1);
      
      results.anonKey = {
        success: !anonError,
        data: anonData,
        error: anonError?.message
      };
    }
    
    // Test 3: Try with leagues table (which has RLS)
    if (supabaseServiceKey && supabaseUrl) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      const { data: leaguesData, error: leaguesError } = await supabaseService
        .from('leagues')
        .select('*')
        .limit(1);
      
      results.leagues = {
        success: !leaguesError,
        data: leaguesData,
        error: leaguesError?.message
      };
    }
    
    return NextResponse.json({
      success: true,
      tests: results,
      tableName: 'states',
      message: 'Testing both service role and anon keys'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 