import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get operation history from database
    const { data: history, error } = await supabase
      .from('admin_operations')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      // If table doesn't exist, return empty history
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          history: []
        });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      history: history || []
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      history: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { operation, success, apiCalls, duration, details } = await request.json();
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Insert operation record
    const { error } = await supabase
      .from('admin_operations')
      .insert({
        operation,
        success,
        api_calls: apiCalls,
        duration,
        details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      // If table doesn't exist, just log to console instead
      if (error.message.includes('does not exist')) {
        console.log('Operation logged to console (table not available):', {
          operation,
          success,
          apiCalls,
          duration,
          details,
          timestamp: new Date().toISOString()
        });
        return NextResponse.json({
          success: true,
          message: 'Operation logged to console (table not available)'
        });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Operation logged successfully'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 