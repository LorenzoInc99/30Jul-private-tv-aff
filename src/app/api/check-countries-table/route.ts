import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Check if countries table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'countries' });

    if (tableError) {
      // Try a different approach - get sample data to see structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('countries')
        .select('*')
        .limit(1);

      if (sampleError) {
        return NextResponse.json({
          error: 'Error checking countries table',
          tableError: tableError,
          sampleError: sampleError
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Countries table structure (from sample data)',
        sampleData: sampleData,
        hasData: sampleData && sampleData.length > 0
      });
    }

    return NextResponse.json({
      message: 'Countries table structure',
      columns: tableInfo
    });

  } catch (error) {
    console.error('Error in check-countries-table:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 