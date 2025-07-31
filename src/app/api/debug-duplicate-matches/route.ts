import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '2024-06-15';
    const teamName = searchParams.get('team') || 'Salernitana';

    console.log(`Debugging duplicate matches for ${teamName} on ${date}`);

    const supabase = supabaseServer();

    // Let's directly query fixtures for the date and look for matches involving Salernitana
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    // First, let's get all fixtures for that date
    const { data: allFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        id,
        name,
        starting_at,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        league_id
      `)
      .gte('starting_at', startDate.toISOString())
      .lt('starting_at', endDate.toISOString())
      .order('starting_at', { ascending: true });

    if (fixturesError) {
      return NextResponse.json({ 
        error: 'Error fetching fixtures', 
        details: fixturesError 
      }, { status: 500 });
    }

    console.log(`Found ${allFixtures?.length || 0} total fixtures on ${date}`);

    // Now let's find all team IDs that might be Salernitana
    // We'll look for teams that appear in multiple matches at the same time
    const teamIds = new Set<number>();
    allFixtures?.forEach((fixture: any) => {
      teamIds.add(fixture.home_team_id);
      teamIds.add(fixture.away_team_id);
    });

    // Let's check for teams that appear in multiple matches at the same time
    const timeGroups: { [key: string]: any[] } = {};
    allFixtures?.forEach((fixture: any) => {
      const timeKey = fixture.starting_at;
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = [];
      }
      timeGroups[timeKey].push(fixture);
    });

    // Find times where the same team appears in multiple matches
    const duplicateTeamTimes: any[] = [];
    
    Object.entries(timeGroups).forEach(([time, matches]) => {
      if (matches.length > 1) {
        const teamAppearances: { [teamId: number]: any[] } = {};
        
        matches.forEach(match => {
          if (!teamAppearances[match.home_team_id]) {
            teamAppearances[match.home_team_id] = [];
          }
          if (!teamAppearances[match.away_team_id]) {
            teamAppearances[match.away_team_id] = [];
          }
          
          teamAppearances[match.home_team_id].push({
            ...match,
            role: 'home'
          });
          teamAppearances[match.away_team_id].push({
            ...match,
            role: 'away'
          });
        });

        // Check for teams that appear multiple times
        Object.entries(teamAppearances).forEach(([teamId, appearances]) => {
          if (appearances.length > 1) {
            duplicateTeamTimes.push({
              time,
              teamId: parseInt(teamId),
              appearances: appearances.map(a => ({
                fixtureId: a.id,
                fixtureName: a.name,
                role: a.role,
                opponentId: a.role === 'home' ? a.away_team_id : a.home_team_id
              }))
            });
          }
        });
      }
    });

    // Let's also check for duplicate fixture IDs
    const fixtureIds = allFixtures?.map((f: any) => f.id) || [];
    const uniqueIds = [...new Set(fixtureIds)];
    const hasDuplicateIds = fixtureIds.length !== uniqueIds.length;

    return NextResponse.json({
      date: date,
      totalFixtures: allFixtures?.length || 0,
      hasDuplicateIds: hasDuplicateIds,
      duplicateIds: hasDuplicateIds ? fixtureIds.filter((id: any, index: any) => fixtureIds.indexOf(id) !== index) : [],
      duplicateTeamTimes: duplicateTeamTimes,
      allFixtures: allFixtures?.map((fixture: any) => ({
        id: fixture.id,
        name: fixture.name,
        starting_at: fixture.starting_at,
        home_team_id: fixture.home_team_id,
        away_team_id: fixture.away_team_id,
        home_score: fixture.home_score,
        away_score: fixture.away_score,
        league_id: fixture.league_id
      })),
      timeGroups: Object.entries(timeGroups).map(([time, matches]) => ({
        time,
        matchCount: matches.length,
        matches: matches.map(m => ({
          id: m.id,
          name: m.name,
          home_team_id: m.home_team_id,
          away_team_id: m.away_team_id
        }))
      }))
    });

  } catch (error) {
    console.error('Error in debug-duplicate-matches:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
} 