import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    console.log('🔧 Setting up database tables...');
    
    // Create states table
    console.log('Creating states table...');
    const { error: statesError } = await supabase
      .from('states')
      .select('*')
      .limit(1);
    
    if (statesError && statesError.message.includes('does not exist')) {
      console.log('States table does not exist, creating it...');
      // We'll need to create it manually or use a different approach
      // For now, let's just report that we need to create the tables
    }
    
    // Check if tables exist by trying to select from them
    const tables = [
      'states',
      'countries', 
      'bookmakers',
      'leagues',
      'tvstations',
      'teams_new',
      'fixtures'
    ];
    
    const missingTables = [];
    const existingTables = [];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          missingTables.push(table);
        } else {
          existingTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }
    
    console.log(`Existing tables: ${existingTables.join(', ')}`);
    console.log(`Missing tables: ${missingTables.join(', ')}`);
    
    if (missingTables.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing tables: ${missingTables.join(', ')}`,
        missingTables,
        existingTables,
        instructions: [
          'You need to create the missing tables in your Supabase database.',
          'Go to your Supabase dashboard > SQL Editor and run the following SQL:',
          '',
          '-- Create states table',
          'CREATE TABLE IF NOT EXISTS public.states (',
          '  id INTEGER PRIMARY KEY,',
          '  state TEXT NOT NULL,',
          '  name TEXT NOT NULL,',
          '  short_name TEXT,',
          '  developer_name TEXT',
          ');',
          '',
          '-- Create countries table (if not exists)',
          'CREATE TABLE IF NOT EXISTS public.countries (',
          '  id BIGINT PRIMARY KEY,',
          '  name TEXT,',
          '  image_path TEXT,',
          '  created_at TIMESTAMPTZ DEFAULT NOW(),',
          '  updated_at TIMESTAMPTZ DEFAULT NOW()',
          ');',
          '',
          '-- Create venues table',
          'CREATE TABLE IF NOT EXISTS public.venues (',
          '  id INTEGER PRIMARY KEY,',
          '  name TEXT NOT NULL,',
          '  city TEXT,',
          '  capacity INTEGER,',
          '  image_path TEXT,',
          '  country_id INTEGER REFERENCES countries(id)',
          ');'
        ]
      });
    }
    
    console.log('✅ All required tables exist');
    
    return NextResponse.json({ 
      success: true, 
      message: 'All required tables exist in the database',
      existingTables,
      missingTables: []
    });
    
  } catch (error) {
    console.error('❌ Error in database setup:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 