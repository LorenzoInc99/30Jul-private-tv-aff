import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Starting league priority update...');
    
    // Get all leagues
    const { data: leagues, error: leaguesError } = await supabaseServer()
      .from('leagues')
      .select('id');
    
    if (leaguesError) {
      throw new Error(`Failed to fetch leagues: ${leaguesError.message}`);
    }
    
    console.log(`Found ${leagues?.length || 0} leagues to update`);
    
    // Calculate and update priorities for each league
    const updates = [];
    for (const league of leagues || []) {
      try {
        // Get interaction stats for this league (last 30 days)
        const { data: interactions, error: interactionsError } = await supabaseServer()
          .from('league_interactions')
          .select('action, value')
          .eq('league_id', league.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        if (interactionsError) {
          console.error(`Failed to fetch interactions for league ${league.id}:`, interactionsError);
          continue;
        }
        
        // Calculate priority based on interactions
        const stats = (interactions || []).reduce((acc, row) => {
          if (row.action === 'league_view') acc.views++;
          if (row.action === 'match_click') acc.matchClicks++;
          if (row.action === 'time_spent') acc.totalTime += row.value || 0;
          if (row.action === 'league_search') acc.searches++;
          return acc;
        }, { views: 0, matchClicks: 0, totalTime: 0, searches: 0 });
        
        const avgTime = stats.views > 0 ? stats.totalTime / stats.views : 0;
        
        // Calculate interaction score
        const interactionScore = 
          (stats.views * 0.3) +
          (stats.matchClicks * 0.4) +
          (avgTime * 0.2) +
          (stats.searches * 0.1);
        
        // Convert to priority (lower = higher priority)
        const priority = Math.max(1, Math.floor(100 - interactionScore));
        
        updates.push({
          league_id: league.id,
          priority: priority,
          last_updated: new Date().toISOString()
        });
        
        console.log(`League ${league.id}: views=${stats.views}, clicks=${stats.matchClicks}, priority=${priority}`);
        
      } catch (error) {
        console.error(`Error processing league ${league.id}:`, error);
      }
    }
    
    // Batch update priorities
    if (updates.length > 0) {
      const { error: updateError } = await supabaseServer()
        .from('league_priorities')
        .upsert(updates, { 
          onConflict: 'league_id',
          ignoreDuplicates: false 
        });
      
      if (updateError) {
        throw new Error(`Failed to update priorities: ${updateError.message}`);
      }
      
      console.log(`Updated priorities for ${updates.length} leagues`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated priorities for ${updates.length} leagues`,
      updated: updates.length
    });
    
  } catch (error) {
    console.error('League priority update failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
