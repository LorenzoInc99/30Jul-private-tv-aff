import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Test 1: Get all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5);

    // Test 2: Get a few leagues with their country_id
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('id, name, country_id')
      .limit(5);

    // Test 3: Manual join test
    const countriesMap = new Map();
    (countries || []).forEach((country: any) => {
      countriesMap.set(country.id, country);
    });

    const leaguesWithCountries = (leagues || []).map((league: any) => ({
      league: league,
      country: countriesMap.get(league.country_id)
    }));

    return NextResponse.json({
      message: 'Country data test results',
      countries: countries,
      countriesError: countriesError,
      leagues: leagues,
      leaguesError: leaguesError,
      leaguesWithCountries: leaguesWithCountries
    });

  } catch (error) {
    console.error('Error in test-country-data:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 