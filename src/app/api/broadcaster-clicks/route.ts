import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { broadcasterIds } = await request.json();
    console.log('POST request received with broadcasterIds:', broadcasterIds);
    
    if (!broadcasterIds || !Array.isArray(broadcasterIds) || broadcasterIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'broadcasterIds array is required'
      }, { status: 400 });
    }

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // Debug: Check if we have the service role key
    console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Process each broadcaster click
    const results = [];
    for (const broadcasterId of broadcasterIds) {
      try {
        console.log(`Processing broadcaster ${broadcasterId}...`);
        
        // Check if record exists
        const { data: existing, error: selectError } = await supabase
          .from('broadcaster_clicks')
          .select('*')
          .eq('broadcaster_id', broadcasterId)
          .single();

        console.log(`Select result for ${broadcasterId}:`, { existing, selectError });

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw selectError;
        }

        if (existing) {
          // Update existing record
          console.log(`Updating existing record for ${broadcasterId}`);
          const { error: updateError } = await supabase
            .from('broadcaster_clicks')
            .update({ 
              click_count: existing.click_count + 1,
              last_updated: new Date().toISOString()
            })
            .eq('broadcaster_id', broadcasterId);

          if (updateError) {
            console.error(`Update error for ${broadcasterId}:`, updateError);
            throw updateError;
          }
          results.push({ broadcasterId, action: 'updated', newCount: existing.click_count + 1 });
        } else {
          // Insert new record
          console.log(`Creating new record for ${broadcasterId}`);
          const { error: insertError } = await supabase
            .from('broadcaster_clicks')
            .insert({
              broadcaster_id: broadcasterId,
              click_count: 1,
              last_updated: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Insert error for ${broadcasterId}:`, insertError);
            throw insertError;
          }
          results.push({ broadcasterId, action: 'created', newCount: 1 });
        }
      } catch (error) {
        console.error(`Error processing broadcaster ${broadcasterId}:`, error);
        results.push({ broadcasterId, action: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${broadcasterIds.length} broadcaster clicks`,
      results
    });

  } catch (error) {
    console.error('Broadcaster clicks tracking error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get click counts for all broadcasters
    const { data: clickData, error } = await supabase
      .from('broadcaster_clicks')
      .select('broadcaster_id, click_count, last_updated')
      .order('click_count', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Fetched click data:', clickData);

    return NextResponse.json({
      success: true,
      clickCounts: clickData || []
    });

  } catch (error) {
    console.error('Error fetching click counts:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
