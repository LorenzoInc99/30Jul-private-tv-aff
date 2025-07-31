import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables'
      });
    }

    console.log('Testing schema access...');
    
    // Create client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const tests = [];
    
    // Test 1: Try with explicit public schema
    try {
      const { data: test1Data, error: test1Error } = await supabase
        .from('public.states')
        .select('*')
        .limit(1);
      
      tests.push({
        name: 'public.states',
        success: !test1Error,
        error: test1Error?.message
      });
    } catch (error) {
      tests.push({
        name: 'public.states',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: Try without schema (default)
    try {
      const { data: test2Data, error: test2Error } = await supabase
        .from('states')
        .select('*')
        .limit(1);
      
      tests.push({
        name: 'states (default)',
        success: !test2Error,
        error: test2Error?.message
      });
    } catch (error) {
      tests.push({
        name: 'states (default)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 3: Try to access a different table
    try {
      const { data: test3Data, error: test3Error } = await supabase
        .from('countries')
        .select('*')
        .limit(1);
      
      tests.push({
        name: 'countries',
        success: !test3Error,
        error: test3Error?.message
      });
    } catch (error) {
      tests.push({
        name: 'countries',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 4: Try to access a system table
    try {
      const { data: test4Data, error: test4Error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(1);
      
      tests.push({
        name: 'pg_tables (system)',
        success: !test4Error,
        error: test4Error?.message
      });
    } catch (error) {
      tests.push({
        name: 'pg_tables (system)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 5: Try to get database info
    try {
      const { data: test5Data, error: test5Error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);
      
      tests.push({
        name: 'information_schema.tables',
        success: !test5Error,
        error: test5Error?.message
      });
    } catch (error) {
      tests.push({
        name: 'information_schema.tables',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const successfulTests = tests.filter(t => t.success);
    const failedTests = tests.filter(t => !t.success);
    
    return NextResponse.json({
      success: successfulTests.length > 0,
      message: `Schema tests completed. ${successfulTests.length} successful, ${failedTests.length} failed.`,
      successfulTests,
      failedTests,
      allTests: tests
    });
    
  } catch (error) {
    console.error('Schema test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 