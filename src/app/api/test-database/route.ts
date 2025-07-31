import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase.js';

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Test different table names that might exist
    const tableTests = [
      'leagues',
      'competitions', 
      'Competitions',
      'fixtures',
      'states',
      'countries'
    ];
    
    const results: Record<string, any> = {};
    
    for (const tableName of tableTests) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        results[tableName] = {
          exists: !error,
          count: data?.length || 0,
          error: error ? {
            code: error.code,
            message: error.message
          } : null
        };
      } catch (e) {
        results[tableName] = {
          exists: false,
          error: {
            message: e instanceof Error ? e.message : 'Unknown error'
          }
        };
      }
    }

    // Test fixtures table specifically with more details
    try {
      const { data: fixturesSample, error: fixturesError } = await supabase
        .from('fixtures')
        .select('id, home_team_id, away_team_id, home_score, away_score, starting_at')
        .limit(3);

      results.fixturesDetails = {
        sample: fixturesSample,
        error: fixturesError,
        count: fixturesSample?.length || 0
      };
    } catch (e) {
      results.fixturesDetails = {
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      tableTests: results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 