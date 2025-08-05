import { supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the specific country with ID 1161 (the one linked to Scottish Premiership)
    const { data: country1161, error: error1 } = await supabaseServer()
      .from('countries')
      .select('*')
      .eq('id', 1161)
      .single();

    // Get Scotland country
    const { data: scotland, error: error2 } = await supabaseServer()
      .from('countries')
      .select('*')
      .ilike('name', '%Scotland%')
      .single();

    // Get Seychelles country
    const { data: seychelles, error: error3 } = await supabaseServer()
      .from('countries')
      .select('*')
      .ilike('name', '%Seychelles%')
      .single();

    // Get all countries to see the pattern
    const { data: allCountries, error: error4 } = await supabaseServer()
      .from('countries')
      .select('id, name, image_path')
      .order('name')
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        country1161,
        scotland,
        seychelles,
        allCountries: allCountries?.slice(0, 20), // First 20 countries
        errors: {
          country1161: error1?.message,
          scotland: error2?.message,
          seychelles: error3?.message,
          allCountries: error4?.message
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 