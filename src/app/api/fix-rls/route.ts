import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Failed to create Supabase client' },
        { status: 500 }
      );
    }

    console.log('Attempting to fix RLS policies...');
    
    // Try to create a simple policy that allows all access
    // Note: This is a simplified approach - in production you'd want more specific policies
    
    const tables = [
      'states',
      'countries', 
      'bookmakers',
      'leagues',
      'tvstations',
      'teams_new',
      'fixtures',
      'test_connection'
    ];
    
    const results = [];
    
    for (const table of tables) {
      try {
        // Try to disable RLS for the table
        const { error } = await supabase.rpc('disable_rls', { table_name: table });
        
        if (error) {
          console.log(`Could not disable RLS for ${table}:`, error.message);
          results.push({
            table,
            action: 'disable_rls',
            success: false,
            error: error.message
          });
        } else {
          console.log(`Successfully disabled RLS for ${table}`);
          results.push({
            table,
            action: 'disable_rls',
            success: true
          });
        }
      } catch (error) {
        console.log(`Exception for ${table}:`, error);
        results.push({
          table,
          action: 'disable_rls',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return NextResponse.json({
      success: successful.length > 0,
      message: `RLS fix attempted. ${successful.length} successful, ${failed.length} failed.`,
      successful,
      failed,
      instructions: [
        'If RLS policies could not be disabled automatically, you need to do it manually:',
        '',
        '1. Go to your Supabase Dashboard',
        '2. Navigate to Authentication → Policies',
        '3. For each table, click the toggle to disable RLS',
        '4. Or create policies that allow service role access',
        '',
        'Alternative: Create policies with this SQL:',
        '',
        '-- Example policy for states table',
        'CREATE POLICY "Allow service role access" ON public.states',
        'FOR ALL USING (true);',
        '',
        '-- Repeat for other tables'
      ]
    });
    
  } catch (error) {
    console.error('RLS fix failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 