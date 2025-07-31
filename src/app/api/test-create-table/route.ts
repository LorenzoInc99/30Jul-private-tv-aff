import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables'
      });
    }

    console.log('Testing table creation...');
    
    // Create client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Try to create a simple table using raw SQL
    // Note: This might not work if exec_sql function doesn't exist
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', { 
        sql: 'CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY, name TEXT);' 
      });
    
    if (createError) {
      console.log('Create table failed:', createError);
      return NextResponse.json({
        success: false,
        error: 'Could not create test table',
        details: createError.message,
        suggestion: 'The exec_sql function might not exist. Try using the Supabase SQL Editor instead.'
      });
    }
    
    console.log('Table created successfully:', createResult);
    
    // Try to insert data
    const { data: insertData, error: insertError } = await supabase
      .from('test_permissions')
      .insert({ name: 'test' })
      .select();
    
    if (insertError) {
      console.log('Insert failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Could not insert into test table',
        details: insertError.message
      });
    }
    
    console.log('Data inserted:', insertData);
    
    // Clean up
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS test_permissions;' 
      });
    
    if (dropError) {
      console.log('Cleanup failed:', dropError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Table creation test successful',
      insertData
    });
    
  } catch (error) {
    console.error('Table creation test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 