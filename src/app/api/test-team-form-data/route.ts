import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const beforeDate = searchParams.get('beforeDate') || '2025-07-31T23:59:59+00:00';
    const minMatches = parseInt(searchParams.get('minMatches') || '2');

    console.log(`Testing team form data before ${beforeDate} with minimum ${minMatches} matches`);

    // Query to find teams with more than 1 match before the specified date
    const { data: teamStats, error } = await supabaseServer()
      .from('fixtures')
      .select(`
        home_team_id,
        away_team_id,
        home_team:teams_new!fixtures_home_team_id_fkey1(name),
        away_team:teams_new!fixtures_away_team_id_fkey1(name)
      `)
      .lt('starting_at', beforeDate)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null);

    if (error) {
      console.error('Error fetching team stats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count matches per team
    const teamMatchCounts: { [key: number]: { name: string, count: number, lastMatch: string } } = {};

    teamStats?.forEach((fixture: any) => {
      // Count home team
      if (fixture.home_team_id) {
        if (!teamMatchCounts[fixture.home_team_id]) {
          teamMatchCounts[fixture.home_team_id] = {
            name: fixture.home_team?.name || `Team ${fixture.home_team_id}`,
            count: 0,
            lastMatch: fixture.starting_at
          };
        }
        teamMatchCounts[fixture.home_team_id].count++;
      }

      // Count away team
      if (fixture.away_team_id) {
        if (!teamMatchCounts[fixture.away_team_id]) {
          teamMatchCounts[fixture.away_team_id] = {
            name: fixture.away_team?.name || `Team ${fixture.away_team_id}`,
            count: 0,
            lastMatch: fixture.starting_at
          };
        }
        teamMatchCounts[fixture.away_team_id].count++;
      }
    });

    // Filter teams with enough matches
    const teamsWithEnoughMatches = Object.entries(teamMatchCounts)
      .filter(([teamId, stats]) => stats.count >= minMatches)
      .map(([teamId, stats]) => ({
        teamId: parseInt(teamId),
        name: stats.name,
        matchCount: stats.count,
        lastMatch: stats.lastMatch
      }))
      .sort((a, b) => b.matchCount - a.matchCount);

    // Get a sample of recent matches for the top teams
    const sampleMatches = [];
    for (const team of teamsWithEnoughMatches.slice(0, 5)) {
      const { data: recentMatches } = await supabaseServer()
        .from('fixtures')
        .select(`
          id,
          name,
          starting_at,
          home_team_id,
          away_team_id,
          home_score,
          away_score,
          home_team:teams_new!fixtures_home_team_id_fkey1(name),
          away_team:teams_new!fixtures_away_team_id_fkey1(name)
        `)
        .or(`home_team_id.eq.${team.teamId},away_team_id.eq.${team.teamId}`)
        .lt('starting_at', beforeDate)
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .order('starting_at', { ascending: false })
        .limit(5);

      sampleMatches.push({
        teamId: team.teamId,
        teamName: team.name,
        matchCount: team.matchCount,
        recentMatches: recentMatches?.map((match: any) => ({
          id: match.id,
          name: match.name,
          date: match.starting_at,
          homeTeam: match.home_team?.name,
          awayTeam: match.away_team?.name,
          homeScore: match.home_score,
          awayScore: match.away_score,
          isHomeTeam: match.home_team_id === team.teamId,
          result: match.home_team_id === team.teamId 
            ? (match.home_score > match.away_score ? 'win' : match.home_score < match.away_score ? 'loss' : 'draw')
            : (match.away_score > match.home_score ? 'win' : match.away_score < match.home_score ? 'loss' : 'draw')
        })) || []
      });
    }

    return NextResponse.json({
      success: true,
      beforeDate,
      minMatches,
      totalTeamsWithMatches: teamsWithEnoughMatches.length,
      teamsWithEnoughMatches,
      sampleMatches
    });

  } catch (error) {
    console.error('Error in test-team-form-data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 