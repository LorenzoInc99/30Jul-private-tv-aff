import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { clicksToSend } = await request.json();
    
    // Validate input
    if (!clicksToSend || !Array.isArray(clicksToSend) || clicksToSend.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 });
    }

    // Validate each click data
    for (const click of clicksToSend) {
      if (!click.broadcasterId || !click.matchId || !click.count || 
          typeof click.broadcasterId !== 'number' || 
          typeof click.matchId !== 'number' || 
          typeof click.count !== 'number' ||
          click.broadcasterId <= 0 || 
          click.matchId <= 0 || 
          click.count <= 0) {
        return NextResponse.json({
          success: false,
          message: 'Invalid click data'
        }, { status: 400 });
      }
    }

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Database connection failed');
    }

    // Process each click
    const results = [];
    for (const clickData of clicksToSend) {
      const { broadcasterId, matchId, count } = clickData;
      try {
        // Process broadcaster click
        
        // Check if record exists (match-specific)
        const { data: existing, error: selectError } = await supabase
          .from('match_broadcaster_clicks')
          .select('*')
          .eq('match_id', matchId)
          .eq('broadcaster_id', broadcasterId)
          .single();

        // Check for database errors

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw selectError;
        }

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('match_broadcaster_clicks')
            .update({ 
              click_count: existing.click_count + count,
              last_updated: new Date().toISOString()
            })
            .eq('match_id', matchId)
            .eq('broadcaster_id', broadcasterId);

          if (updateError) {
            throw updateError;
          }
          results.push({ broadcasterId, action: 'updated', newCount: existing.click_count + count });
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('match_broadcaster_clicks')
            .insert({
              match_id: matchId,
              broadcaster_id: broadcasterId,
              click_count: count,
              last_updated: new Date().toISOString()
            });

          if (insertError) {
            throw insertError;
          }
          results.push({ broadcasterId, action: 'created', newCount: count });
        }

        // Also update the global broadcaster_clicks table
        const { data: globalExisting, error: globalSelectError } = await supabase
          .from('broadcaster_clicks')
          .select('*')
          .eq('broadcaster_id', broadcasterId)
          .single();

        if (globalSelectError && globalSelectError.code !== 'PGRST116') {
          // Only log errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error(`Global select error for ${broadcasterId}:`, globalSelectError);
          }
        } else if (globalExisting) {
          // Update global count
          const { error: globalUpdateError } = await supabase
            .from('broadcaster_clicks')
            .update({ 
              click_count: globalExisting.click_count + count,
              last_updated: new Date().toISOString()
            })
            .eq('broadcaster_id', broadcasterId);

          if (globalUpdateError) {
            // Only log errors in development
            if (process.env.NODE_ENV === 'development') {
              console.error(`Global update error for ${broadcasterId}:`, globalUpdateError);
            }
          }
        } else {
          // Insert new global record
          const { error: globalInsertError } = await supabase
            .from('broadcaster_clicks')
            .insert({
              broadcaster_id: broadcasterId,
              click_count: count,
              last_updated: new Date().toISOString()
            });

          if (globalInsertError) {
            // Only log errors in development
            if (process.env.NODE_ENV === 'development') {
              console.error(`Global insert error for ${broadcasterId}:`, globalInsertError);
            }
          }
        }
      } catch (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error processing broadcaster ${broadcasterId}:`, error);
        }
        results.push({ broadcasterId, action: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${clicksToSend.length} broadcaster clicks`,
      results
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Broadcaster clicks tracking error:', error);
    }
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get click counts for broadcasters (match-specific if matchId provided)
    let query = supabase
      .from('match_broadcaster_clicks')
      .select('broadcaster_id, click_count, last_updated');
    
    if (matchId) {
      query = query.eq('match_id', matchId);
    }
    
    const { data: clickData, error } = await query
      .order('click_count', { ascending: false });

    if (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Database error:', error);
      }
      throw error;
    }

    // Return click data

    return NextResponse.json({
      success: true,
      clickCounts: clickData || []
    });

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching click counts:', error);
    }
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
