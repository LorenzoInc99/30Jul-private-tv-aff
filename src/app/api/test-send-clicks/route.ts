import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { broadcasterIds } = await request.json();
    
    if (!broadcasterIds || !Array.isArray(broadcasterIds)) {
      return NextResponse.json({
        success: false,
        message: 'broadcasterIds array is required'
      }, { status: 400 });
    }

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    console.log('Processing clicks for broadcasters:', broadcasterIds);

    // Process each broadcaster click
    const results = [];
    for (const broadcasterId of broadcasterIds) {
      try {
        // Check if record exists
        const { data: existing, error: selectError } = await supabase
          .from('broadcaster_clicks')
          .select('*')
          .eq('broadcaster_id', broadcasterId)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          throw selectError;
        }

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('broadcaster_clicks')
            .update({ 
              click_count: existing.click_count + 1,
              last_updated: new Date().toISOString()
            })
            .eq('broadcaster_id', broadcasterId);

          if (updateError) throw updateError;
          results.push({ broadcasterId, action: 'updated', newCount: existing.click_count + 1 });
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('broadcaster_clicks')
            .insert({
              broadcaster_id: broadcasterId,
              click_count: 1,
              last_updated: new Date().toISOString()
            });

          if (insertError) throw insertError;
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
    console.error('Test clicks tracking error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
