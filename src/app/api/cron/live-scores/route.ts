import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const logs: string[] = [];
  let apiCalls = 0;
  let updatesApplied = 0;

  try {
    // Verify cron job authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logs.push(`🔄 Live score update started at ${new Date().toISOString()}`);

    if (!SPORTMONKS_API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }

    // Get only LIVE matches (state_id: 2, 3, 4)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: liveMatches, error: matchesError } = await supabase
      .from('fixtures')
      .select('id, name, starting_at, state_id, home_score, away_score, league_id')
      .in('state_id', [2, 3, 4]) // Live, HT, FT
      .gte('starting_at', oneHourAgo.toISOString())
      .lte('starting_at', twoHoursFromNow.toISOString())
      .order('starting_at', { ascending: true });

    if (matchesError) {
      throw new Error(`Database error: ${matchesError.message}`);
    }

    if (!liveMatches || liveMatches.length === 0) {
      logs.push('✅ No live matches found');
      return NextResponse.json({
        success: true,
        duration: `${Date.now() - startTime}ms`,
        apiCalls: 0,
        updatesApplied: 0,
        logs: ['No live matches to update']
      });
    }

    logs.push(`📊 Found ${liveMatches.length} live matches`);

    // Update each live match
    for (const match of liveMatches) {
      try {
        apiCalls++;

        // Fetch latest score data from SportMonks
        const url = `https://api.sportmonks.com/v3/football/fixtures/${match.id}`;
        const params = {
          api_token: SPORTMONKS_API_TOKEN,
          include: 'scores;participants;state'
        };

        const response = await fetch(`${url}?${new URLSearchParams(params)}`);
        
        if (!response.ok) {
          logs.push(`❌ Error fetching ${match.name}: HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (!data.data) {
          logs.push(`❌ No data for ${match.name}`);
          continue;
        }

        const fixtureData = data.data;
        const { homeScore, awayScore } = extractScores(fixtureData);
        
        let hasUpdates = false;
        const updateData: any = {};

        // Check if scores changed
        if (homeScore !== match.home_score || awayScore !== match.away_score) {
          updateData.home_score = homeScore;
          updateData.away_score = awayScore;
          hasUpdates = true;
          logs.push(`⚽ ${match.name}: ${match.home_score}-${match.away_score} → ${homeScore}-${awayScore}`);
        }

        // Check if status changed
        if (fixtureData.state_id !== match.state_id) {
          updateData.state_id = fixtureData.state_id;
          hasUpdates = true;
          logs.push(`📊 ${match.name}: Status changed to ${fixtureData.state_id}`);
        }

        // Update database if there are changes
        if (hasUpdates) {
          const { error: updateError } = await supabase
            .from('fixtures')
            .update(updateData)
            .eq('id', match.id);

          if (updateError) {
            logs.push(`❌ Error updating ${match.name}: ${updateError.message}`);
          } else {
            updatesApplied++;
            logs.push(`✅ Updated ${match.name}`);
          }
        } else {
          logs.push(`ℹ️ No changes for ${match.name}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        logs.push(`❌ Error updating ${match.name}: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    logs.push(`✅ Live update completed in ${duration}ms`);
    logs.push(`📊 API calls: ${apiCalls}, Updates: ${updatesApplied}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      updatesApplied,
      logs
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ Error: ${error.message}`);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      apiCalls,
      updatesApplied: 0,
      logs
    }, { status: 500 });
  }
}

// Optimized score extraction
function extractScores(fixtureData: any) {
  let homeScore = null;
  let awayScore = null;

  const scoresData = fixtureData.scores || [];

  if (scoresData.length === 0) {
    return { homeScore, awayScore };
  }

  // Priority: CURRENT > 2ND_HALF > 1ST_HALF
  const scoreTypes = ['CURRENT', '2ND_HALF', '1ST_HALF'];
  
  for (const scoreType of scoreTypes) {
    const scores = scoresData.filter((s: any) => s.description === scoreType);
    
    if (scores.length > 0) {
      for (const scoreEntry of scores) {
        const scoreData = scoreEntry.score || {};
        const participant = scoreData.participant;
        const goals = scoreData.goals;

        if (participant === 'home' && goals !== null && goals !== undefined) {
          homeScore = parseInt(goals);
        } else if (participant === 'away' && goals !== null && goals !== undefined) {
          awayScore = parseInt(goals);
        }
      }
      
      // If we have both scores, we're done
      if (homeScore !== null && awayScore !== null) {
        break;
      }
    }
  }

  return { homeScore, awayScore };
}
