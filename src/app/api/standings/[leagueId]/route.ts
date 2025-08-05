import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Function to calculate team statistics from fixtures
async function calculateTeamStats(teamId: number, seasonId: number) {
  const fixturesResult = await executeQuery(`
    SELECT 
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      state_id
    FROM fixtures 
    WHERE season_id = $1 
    AND (home_team_id = $2 OR away_team_id = $2)
    AND state_id IN (1, 2, 3, 4, 5) -- Completed match states
  `, [seasonId, teamId]);

  if (!fixturesResult.success || !fixturesResult.data) {
    return {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0
    };
  }

  let played = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  fixturesResult.data.forEach((fixture: any) => {
    if (fixture.home_score !== null && fixture.away_score !== null) {
      played++;
      
      const isHomeTeam = fixture.home_team_id === teamId;
      const teamScore = isHomeTeam ? fixture.home_score : fixture.away_score;
      const opponentScore = isHomeTeam ? fixture.away_score : fixture.home_score;
      
      goalsFor += teamScore;
      goalsAgainst += opponentScore;
      
      if (teamScore > opponentScore) {
        won++;
      } else if (teamScore === opponentScore) {
        drawn++;
      } else {
        lost++;
      }
    }
  });

  return {
    played,
    won,
    drawn,
    lost,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    goal_difference: goalsFor - goalsAgainst
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const leagueId = parseInt(params.leagueId);
    
    if (isNaN(leagueId)) {
      return NextResponse.json(
        { error: 'Invalid league ID' },
        { status: 400 }
      );
    }

    // Get standings with team and season information using direct database connection
    const standingsResult = await executeQuery(`
      SELECT 
        s.*,
        t.id as team_id,
        t.name as team_name,
        t.short_code as team_short_code,
        t.team_logo_url as team_logo_url,
        se.league_id as season_league_id
      FROM standings s
      LEFT JOIN teams_new t ON s.team_id = t.id
      LEFT JOIN seasons se ON s.season_id = se.id
      ORDER BY s.position ASC
    `);

    if (!standingsResult.success) {
      console.error('Standings query error:', standingsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch standings' },
        { status: 500 }
      );
    }

    // Transform the data and filter by league
    const filteredStandings = standingsResult.data
      ?.filter((row: any) => {
        // Filter by the requested league ID
        return row.season_league_id === leagueId;
      }) || [];

    // Calculate detailed stats for each team
    const standingsWithStats = await Promise.all(
      filteredStandings.map(async (row: any) => {
        const stats = await calculateTeamStats(row.team_id, row.season_id);
        
        return {
          id: row.id,
          season_id: row.season_id,
          team_id: row.team_id,
          position: row.position,
          points: row.points,
          played: stats.played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          goals_for: stats.goals_for,
          goals_against: stats.goals_against,
          goal_difference: stats.goal_difference,
          team: {
            id: row.team_id,
            name: row.team_name,
            short_code: row.team_short_code,
            team_logo_url: row.team_logo_url
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: standingsWithStats,
      count: standingsWithStats.length,
      metadata: {
        requestedLeagueId: leagueId,
        totalStandingsBeforeFilter: standingsResult.data?.length || 0,
        filteredStandings: standingsWithStats.length
      }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 