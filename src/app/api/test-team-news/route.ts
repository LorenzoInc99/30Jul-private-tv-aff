import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Try to query the team_news table
    const { data, error } = await supabase
      .from('team_news')
      .select('*')
      .limit(5);
    
    if (error) {
      return NextResponse.json({ 
        exists: false, 
        error: error.message,
        code: error.code 
      });
    }
    
    return NextResponse.json({ 
      exists: true, 
      count: data?.length || 0,
      sampleData: data?.slice(0, 3) || []
    });
    
  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      error: 'Internal server error' 
    });
  }
} 