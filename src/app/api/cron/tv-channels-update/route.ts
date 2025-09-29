import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logs.push('❌ Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logs.push('📺 Starting TV channels update for match day accuracy...');

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get today's date and next 3 days for comprehensive coverage
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];

    logs.push(`📅 Checking TV channels for matches from ${startDate} to ${endDate}`);

    // Get fixtures for today and tomorrow (matches that need accurate TV info)
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, name, starting_at, league_id')
      .gte('starting_at', startDate)
      .lte('starting_at', endDate)
      .order('starting_at', { ascending: true })
      .limit(50); // Focus on upcoming matches

    if (fixturesError) {
      throw new Error(`Database error fetching fixtures: ${fixturesError.message}`);
    }

    if (!fixtures || fixtures.length === 0) {
      logs.push('✅ No upcoming fixtures found for TV channel updates');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        logs,
        results: { message: 'No upcoming fixtures' }
      });
    }

    logs.push(`Found ${fixtures.length} upcoming fixtures to update TV channels`);

    let tvChannelsUpdated = 0;
    let errorsCount = 0;

    // Update TV channels for each fixture
    for (const fixture of fixtures) {
      try {
        apiCalls++;
        
        // Fetch latest TV channel data for this fixture
        const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.id}`;
        const params = {
          api_token: SPORTMONKS_API_TOKEN,
          include: 'tvstations'
        };

        const response = await fetch(`${url}?${new URLSearchParams(params)}`);

        if (!response.ok) {
          logs.push(`  ❌ Error fetching TV data for fixture ${fixture.id}: HTTP ${response.status}`);
          errorsCount++;
          continue;
        }

        const data = await response.json();
        const fixtureData = data.data;

        if (!fixtureData || !fixtureData.tvstations) {
          logs.push(`  ℹ️ No TV stations data for ${fixture.name} (ID: ${fixture.id})`);
          continue;
        }

        // Process TV station data
        const tvRelationships = Array.isArray(fixtureData.tvstations) 
          ? fixtureData.tvstations 
          : [fixtureData.tvstations];

        const fixtureTvData = [];

        for (const tvRel of tvRelationships) {
          const tvStationId = tvRel.tvstation_id || tvRel.tvstation?.id || tvRel.id;
          const countryId = tvRel.country_id || tvRel.country?.id || 1;

          if (tvStationId && tvStationId >= 1 && tvStationId <= 10000) {
            fixtureTvData.push({
              fixture_id: fixture.id,
              tvstation_id: tvStationId,
              country_id: countryId
            });
          }
        }

        if (fixtureTvData.length > 0) {
          // Upsert TV channel data (this will update existing or insert new)
          const { error: tvError } = await supabase
            .from('fixturetvstations')
            .upsert(fixtureTvData, { 
              onConflict: 'fixture_id,tvstation_id,country_id' 
            });

          if (tvError) {
            logs.push(`  ❌ Database error updating TV channels for ${fixture.name}: ${tvError.message}`);
            errorsCount++;
          } else {
            tvChannelsUpdated += fixtureTvData.length;
            logs.push(`  ✅ Updated ${fixtureTvData.length} TV channels for ${fixture.name}`);
          }
        } else {
          logs.push(`  ℹ️ No valid TV channels found for ${fixture.name}`);
        }

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        errorsCount++;
        logs.push(`  ❌ Failed to process TV channels for fixture ${fixture.id}: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    logs.push(`✅ TV channels update completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Fixtures processed: ${fixtures.length}`);
    logs.push(`  TV channels updated: ${tvChannelsUpdated}`);
    logs.push(`  Errors: ${errorsCount}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        fixturesProcessed: fixtures.length,
        tvChannelsUpdated,
        errors: errorsCount
      }
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ Critical error in TV channels cron: ${error.message}`);
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      apiCalls,
      logs
    }, { status: 500 });
  }
}











