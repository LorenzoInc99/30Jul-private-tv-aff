import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get TV stations from database
    const { data: tvStations, error } = await supabase
      .from('tvstations')
      .select('id, name, url, image_path')
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Ensure we always return an array
    const tvStationsArray = Array.isArray(tvStations) ? tvStations : [];

    return NextResponse.json({
      success: true,
      tvStations: tvStationsArray
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      tvStations: []
    }, { status: 500 });
  }
} 