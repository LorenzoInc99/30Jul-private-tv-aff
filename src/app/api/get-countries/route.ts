import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Get all countries
    const { data: countries, error } = await supabase
      .from('countries')
      .select('*');

    if (error) {
      console.error('Error fetching countries:', error);
      return NextResponse.json({
        error: 'Failed to fetch countries',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      countries: countries || []
    });

  } catch (error) {
    console.error('Error in get-countries:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 