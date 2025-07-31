import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Failed to create Supabase client' },
        { status: 500 }
      );
    }

    console.log('Testing direct SQL access...');
    
    // Test 1: Simple SQL query to check if we can access the database
    const { data: sqlTest, error: sqlError } = await supabase
      .rpc('exec_sql', { sql: 'SELECT current_database(), current_user;' });
    
    if (sqlError) {
      console.log('SQL test failed:', sqlError);
    } else {
      console.log('SQL test successful:', sqlTest);
    }
    
    // Test 2: Try to list all tables in the public schema
    const { data: tablesTest, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT table_name 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              ORDER BY table_name;` 
      });
    
    if (tablesError) {
      console.log('Tables test failed:', tablesError);
    } else {
      console.log('Tables test successful:', tablesTest);
    }
    
    // Test 3: Try to check RLS status on states table
    const { data: rlsTest, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT schemaname, tablename, rowsecurity 
              FROM pg_tables 
              WHERE tablename = 'states';` 
      });
    
    if (rlsError) {
      console.log('RLS test failed:', rlsError);
    } else {
      console.log('RLS test successful:', rlsTest);
    }
    
    // Test 4: Try a simple select with explicit schema
    const { data: directTest, error: directError } = await supabase
      .from('states')
      .select('*')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      tests: {
        sql: { success: !sqlError, data: sqlTest, error: sqlError?.message },
        tables: { success: !tablesError, data: tablesTest, error: tablesError?.message },
        rls: { success: !rlsError, data: rlsTest, error: rlsError?.message },
        direct: { success: !directError, data: directTest, error: directError?.message }
      },
      message: 'SQL tests completed'
    });
    
  } catch (error) {
    console.error('SQL test failed:', error);
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