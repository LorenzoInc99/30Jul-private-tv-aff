import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    const stats: any = {};

    // Get counts for each table
    const tables = [
      'bookmakers',
      'leagues', 
      'tvstations',
      'teams_new',
      'fixtures',
      'countries'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error(`Error counting ${table}:`, error);
          stats[table] = { count: 0, lastUpdate: null };
        } else {
          stats[table] = { count: count || 0, lastUpdate: null };
        }
      } catch (error) {
        console.error(`Error accessing table ${table}:`, error);
        stats[table] = { count: 0, lastUpdate: null };
      }
    }

    // Try to get last update timestamps (if tables have updated_at columns)
    try {
      // For teams_new, check if any have team_logo_url
      const { count: teamsWithLogos } = await supabase
        .from('teams_new')
        .select('*', { count: 'exact', head: true })
        .not('team_logo_url', 'is', null);

      if (stats.teams_new) {
        stats.teams_new.teamsWithLogos = teamsWithLogos || 0;
      }
    } catch (error) {
      console.error('Error getting teams with logos count:', error);
    }

    // Get some sample data for verification
    try {
      const { data: recentFixtures } = await supabase
        .from('fixtures')
        .select('starting_at')
        .order('starting_at', { ascending: false })
        .limit(1);

      if (recentFixtures && recentFixtures.length > 0) {
        stats.latestFixtureDate = recentFixtures[0].starting_at;
      }
    } catch (error) {
      console.error('Error getting latest fixture date:', error);
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      stats: {},
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 