import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check what role we're using
    const { data, error } = await supabase
      .from('pg_roles')
      .select('rolname')
      .eq('rolname', 'current_user')
      .single();
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }
    
    return NextResponse.json({
      success: true,
      currentUser: data
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
