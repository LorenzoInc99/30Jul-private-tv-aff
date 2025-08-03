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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test 1: Try to get current user (should work with service role)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    // Test 2: Try to access a system view
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    // Test 3: Try to access auth.users (should work with service role)
    const { data: authData, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    
    // Test 4: Try to access pg_tables (system catalog)
    const { data: pgData, error: pgError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    // Test 5: Try to access a table that definitely exists (fixtures)
    const { data: fixturesData, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      tests: {
        user: { success: !userError, data: userData, error: userError?.message },
        schema: { success: !schemaError, data: schemaData, error: schemaError?.message },
        auth: { success: !authError, data: authData, error: authError?.message },
        pgTables: { success: !pgError, data: pgData, error: pgError?.message },
        fixtures: { success: !fixturesError, data: fixturesData, error: fixturesError?.message }
      },
      projectId: supabaseUrl.split('//')[1]?.split('.')[0]
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 