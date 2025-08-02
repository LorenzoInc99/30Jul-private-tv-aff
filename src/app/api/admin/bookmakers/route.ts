import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get bookmakers from database
    const { data: bookmakers, error } = await supabase
      .from('bookmakers')
      .select('id, name, url, image_path')
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      bookmakers: bookmakers || []
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      bookmakers: []
    }, { status: 500 });
  }
} 