import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    const schemaInfo: any = {};

    // Test different table names and structures
    const tablesToTest = [
      'bookmakers',
      'Bookmakers',
      'BOOKMAKERS',
      'tvstations',
      'TvStations',
      'leagues',
      'teams_new'
    ];

    for (const tableName of tablesToTest) {
      try {
        console.log(`Testing table: ${tableName}`);
        
        // Try to select from the table
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`Table ${tableName} error:`, error.message);
          schemaInfo[tableName] = { exists: false, error: error.message };
        } else {
          console.log(`Table ${tableName} exists, sample data:`, data);
          schemaInfo[tableName] = { 
            exists: true, 
            sampleData: data?.[0] || null,
            columns: data?.[0] ? Object.keys(data[0]) : []
          };
        }
      } catch (error) {
        console.log(`Exception testing table ${tableName}:`, error);
        schemaInfo[tableName] = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return NextResponse.json({
      success: true,
      schemaInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      schemaInfo: {},
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 