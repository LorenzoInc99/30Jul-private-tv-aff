import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Test 1: Check environment variables
    const envVars = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    };

    // Test 2: Try to access different tables
    const tableTests = {};

    // Test fixtures table
    try {
      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('id')
        .limit(1);
      tableTests.fixtures = { success: !error, error: error?.message };
    } catch (err) {
      tableTests.fixtures = { success: false, error: err.message };
    }

    // Test leagues table
    try {
      const { data: leagues, error } = await supabase
        .from('leagues')
        .select('id')
        .limit(1);
      tableTests.leagues = { success: !error, error: error?.message };
    } catch (err) {
      tableTests.leagues = { success: false, error: err.message };
    }

    // Test countries table
    try {
      const { data: countries, error } = await supabase
        .from('countries')
        .select('id')
        .limit(1);
      tableTests.countries = { success: !error, error: error?.message };
    } catch (err) {
      tableTests.countries = { success: false, error: err.message };
    }

    // Test teams_new table
    try {
      const { data: teams, error } = await supabase
        .from('teams_new')
        .select('id')
        .limit(1);
      tableTests.teams_new = { success: !error, error: error?.message };
    } catch (err) {
      tableTests.teams_new = { success: false, error: err.message };
    }

    return NextResponse.json({
      message: 'Permission test results',
      environment: envVars,
      tableAccess: tableTests
    });

  } catch (error) {
    console.error('Error in test-permissions:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 