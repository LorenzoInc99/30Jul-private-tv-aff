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

    logs.push('🎯 Starting odds update (every 10 minutes)...');

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get fixtures for today and tomorrow that have odds available
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];

    logs.push(`📅 Updating odds for matches from ${startDate} to ${endDate}`);

    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, name, starting_at, has_odds, has_premium_odds')
      .gte('starting_at', startDate)
      .lte('starting_at', endDate)
      .eq('has_odds', true)
      .order('starting_at', { ascending: true })
      .limit(30); // Limit to avoid overwhelming API

    if (fixturesError) {
      throw new Error(`Database error fetching fixtures: ${fixturesError.message}`);
    }

    if (!fixtures || fixtures.length === 0) {
      logs.push('✅ No fixtures with odds found for today/tomorrow');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        logs,
        results: { message: 'No fixtures with odds found' }
      });
    }

    logs.push(`Found ${fixtures.length} fixtures with odds to update`);

    let oddsUpdated = 0;
    let errorsCount = 0;

    // Update odds for each fixture
    for (const fixture of fixtures) {
      try {
        apiCalls++;
        
        // Fetch latest odds data for this fixture
        const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.id}`;
        const params = {
          api_token: SPORTMONKS_API_TOKEN,
          include: 'odds'
        };

        const response = await fetch(`${url}?${new URLSearchParams(params)}`);

        if (!response.ok) {
          logs.push(`  ❌ Error fetching odds for fixture ${fixture.id}: HTTP ${response.status}`);
          errorsCount++;
          continue;
        }

        const data = await response.json();
        const fixtureData = data.data;

        if (!fixtureData || !fixtureData.odds) {
          logs.push(`  ℹ️ No odds data for ${fixture.name} (ID: ${fixture.id})`);
          continue;
        }

        // Process odds data
        const oddsData = Array.isArray(fixtureData.odds) 
          ? fixtureData.odds 
          : [fixtureData.odds];

        const processedOdds = [];

        for (const odd of oddsData) {
          if (odd.bookmaker_id && odd.market_id && odd.label && odd.value) {
            processedOdds.push({
              id: odd.id,
              fixture_id: fixture.id,
              bookmaker_id: odd.bookmaker_id,
              market_id: odd.market_id,
              label: odd.label,
              value: parseFloat(odd.value),
              probability: odd.probability ? parseFloat(odd.probability) : null,
              latest_bookmaker_update: odd.latest_bookmaker_update || new Date().toISOString()
            });
          }
        }

        if (processedOdds.length > 0) {
          // Upsert odds data
          const { error: oddsError } = await supabase
            .from('odds')
            .upsert(processedOdds, { 
              onConflict: 'id' 
            });

          if (oddsError) {
            logs.push(`  ❌ Database error updating odds for ${fixture.name}: ${oddsError.message}`);
            errorsCount++;
          } else {
            oddsUpdated += processedOdds.length;
            logs.push(`  ✅ Updated ${processedOdds.length} odds for ${fixture.name}`);
          }
        } else {
          logs.push(`  ℹ️ No valid odds found for ${fixture.name}`);
        }

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 150));

      } catch (error: any) {
        errorsCount++;
        logs.push(`  ❌ Failed to process odds for fixture ${fixture.id}: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    logs.push(`✅ Odds update completed in ${duration}ms with ${apiCalls} API calls`);
    logs.push(`  Fixtures processed: ${fixtures.length}`);
    logs.push(`  Odds updated: ${oddsUpdated}`);
    logs.push(`  Errors: ${errorsCount}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        fixturesProcessed: fixtures.length,
        oddsUpdated,
        errors: errorsCount
      }
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ Critical error in odds update cron: ${error.message}`);
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      apiCalls,
      logs
    }, { status: 500 });
  }
}
















