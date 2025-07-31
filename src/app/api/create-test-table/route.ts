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

    console.log('Creating test table...');
    
    // Try to create a simple test table
    const { error: createError } = await supabase
      .rpc('exec_sql', { 
        sql: `CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );` 
      });
    
    if (createError) {
      console.log('Create table failed:', createError);
      return NextResponse.json({
        success: false,
        error: 'Could not create test table',
        details: createError.message
      });
    }
    
    console.log('Test table created successfully');
    
    // Try to insert data
    const { data: insertData, error: insertError } = await supabase
      .from('test_table')
      .insert([
        { name: 'Test Entry 1' },
        { name: 'Test Entry 2' }
      ])
      .select();
    
    if (insertError) {
      console.log('Insert failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Could not insert data into test table',
        details: insertError.message
      });
    }
    
    console.log('Data inserted successfully:', insertData);
    
    // Try to read data
    const { data: readData, error: readError } = await supabase
      .from('test_table')
      .select('*');
    
    if (readError) {
      console.log('Read failed:', readError);
      return NextResponse.json({
        success: false,
        error: 'Could not read from test table',
        details: readError.message
      });
    }
    
    console.log('Data read successfully:', readData);
    
    // Clean up - delete the test table
    const { error: deleteError } = await supabase
      .rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS test_table;' 
      });
    
    if (deleteError) {
      console.log('Cleanup failed:', deleteError);
    } else {
      console.log('Test table cleaned up successfully');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test table operations completed successfully',
      insertData,
      readData
    });
    
  } catch (error) {
    console.error('Test table creation failed:', error);
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