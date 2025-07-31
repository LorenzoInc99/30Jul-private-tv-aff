import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing basic Supabase connection...');
    
    const supabase = supabaseServer();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Failed to create Supabase client' },
        { status: 500 }
      );
    }

    console.log('Supabase client created successfully');
    
    // Test 1: Try to get auth user (this should work with service role)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { success: !authError, error: authError?.message });
    
    // Test 2: Try to list all tables using a different approach
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    console.log('Tables test:', { success: !tablesError, data: tablesData, error: tablesError?.message });
    
    // Test 3: Try a simple query on a system table
    const { data: systemData, error: systemError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    console.log('System tables test:', { success: !systemError, data: systemData, error: systemError?.message });
    
    // Test 4: Try to access states table with different approach
    const { data: statesData, error: statesError } = await supabase
      .from('states')
      .select('count')
      .limit(1);
    
    console.log('States test:', { success: !statesError, data: statesData, error: statesError?.message });
    
    return NextResponse.json({
      success: true,
      tests: {
        auth: { success: !authError, error: authError?.message },
        tables: { success: !tablesError, data: tablesData, error: tablesError?.message },
        system: { success: !systemError, data: systemData, error: systemError?.message },
        states: { success: !statesError, data: statesData, error: statesError?.message }
      },
      message: 'Connection tests completed'
    });
    
  } catch (error) {
    console.error('Connection test failed:', error);
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