import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing league tracking system...');
    
    // Test 1: Check if tables exist
    const { data: interactionsTable, error: interactionsError } = await supabaseServer()
      .from('league_interactions')
      .select('count')
      .limit(1);
    
    const { data: prioritiesTable, error: prioritiesError } = await supabaseServer()
      .from('league_priorities')
      .select('count')
      .limit(1);
    
    if (interactionsError || prioritiesError) {
      return NextResponse.json({
        success: false,
        error: 'Tables not found. Please run the migration first.',
        details: {
          interactionsError: interactionsError?.message,
          prioritiesError: prioritiesError?.message
        }
      });
    }
    
    // Test 2: Check initial priorities
    const { data: priorities, error: prioritiesFetchError } = await supabaseServer()
      .from('league_priorities')
      .select('league_id, priority')
      .order('priority', { ascending: true })
      .limit(10);
    
    if (prioritiesFetchError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch priorities',
        details: prioritiesFetchError.message
      });
    }
    
    // Test 3: Check interactions count
    const { data: interactions, error: interactionsFetchError } = await supabaseServer()
      .from('league_interactions')
      .select('count')
      .limit(1);
    
    if (interactionsFetchError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch interactions',
        details: interactionsFetchError.message
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'League tracking system is working!',
      data: {
        tablesExist: true,
        initialPriorities: priorities || [],
        totalInteractions: interactions?.[0]?.count || 0,
        topLeagues: priorities?.slice(0, 5) || []
      }
    });
    
  } catch (error) {
    console.error('League tracking test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
