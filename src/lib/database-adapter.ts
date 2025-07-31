import { supabaseBrowser, supabaseServer } from './supabase';
import { getMatchStatus, transformTeamData, transformTvStationData, transformBookmakerData } from './database-config';

// Type definitions for the new database schema
export interface NewFixture {
  id: number;
  league_id: number;
  season_id: number;
  round_id: number;
  venue_id: number;
  home_team_id: number;
  away_team_id: number;
  name: string;
  starting_at: string;
  starting_at_timestamp: number;
  has_odds: boolean;
  has_premium_odds: boolean;
  state_id: number;
  home_score: number | null;
  away_score: number | null;
}

export interface NewLeague {
  id: number;
  name: string;
  sport_id: number;
  country_id: number;
}

export interface NewTeam {
  id: number;
  name: string;
  short_code: string | null;
  country_id: number;
  venue_id: number;
}

export interface NewFixtureTvStation {
  fixture_id: number;
  tvstation_id: number;
  country_id: number;
}

export interface NewTvStation {
  id: number;
  name: string;
  url: string | null;
  image_path: string | null;
}

export interface NewOdds {
  id: number;
  fixture_id: number;
  bookmaker_id: number;
  market_id: number;
  label: string;
  value: number;
  probability: number | null;
  latest_bookmaker_update: string | null;
  bookmaker?: NewBookmaker; // Optional because it comes from the join
}

export interface NewBookmaker {
  id: number;
  name: string;
  url: string | null;
  image_path: string | null;
}

// Adapter functions to transform new schema to expected frontend format

export async function getMatchesForDate(date: Date, supabase = supabaseBrowser) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  // Fetch fixtures with all related data
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      league:leagues(*),
      home_team:teams_new!fixtures_home_team_id_fkey1(*),
      away_team:teams_new!fixtures_away_team_id_fkey1(*),
      fixturetvstations(
        tvstation:tvstations(*)
      ),
      odds(
        id,
        label,
        value,
        market_id,
        bookmaker:bookmakers(*)
      )
    `)
    .gte('starting_at', start.toISOString())
    .lt('starting_at', end.toISOString())
    .order('starting_at', { ascending: true });

  if (error) {
    throw error;
  }

  // Hardcoded country data from your database
  const countriesMap = new Map([
    [2, { id: 2, name: 'Poland', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/pl.png' }],
    [11, { id: 11, name: 'Germany', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/de.png' }],
    [17, { id: 17, name: 'France', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/fr.png' }],
    [20, { id: 20, name: 'Portugal', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/pt.png' }],
    [32, { id: 32, name: 'Spain', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/es.png' }],
    [38, { id: 38, name: 'Netherlands', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/nl.png' }],
    [41, { id: 41, name: 'Europe', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/eu.png' }],
    [47, { id: 47, name: 'Sweden', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/se.png' }],
    [62, { id: 62, name: 'Switzerland', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/ch.png' }],
    [86, { id: 86, name: 'Ukraine', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/ua.png' }],
    [143, { id: 143, name: 'Austria', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/at.png' }],
    [227, { id: 227, name: 'Russia', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/ru.png' }],
    [251, { id: 251, name: 'Italy', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/it.png' }],
    [266, { id: 266, name: 'Croatia', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/hr.png' }],
    [320, { id: 320, name: 'Denmark', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/dk.png' }],
    [404, { id: 404, name: 'Turkey', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/tr.png' }],
    [462, { id: 462, name: 'England', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/en.png' }],
    [556, { id: 556, name: 'Belgium', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/be.png' }],
    [1161, { id: 1161, name: 'Scotland', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/sc.png' }],
    [1578, { id: 1578, name: 'Norway', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/no.png' }]
  ]);

  // Transform to expected frontend format
  return (fixtures || []).map((fixture: any) => {
    const country = countriesMap.get(fixture.league.country_id);
    
    return {
      id: fixture.id,
      name: fixture.name,
      start_time: fixture.starting_at,
      home_score: fixture.home_score,
      away_score: fixture.away_score,
      status: getMatchStatus(fixture.state_id),
      Competitions: {
        id: fixture.league.id,
        name: fixture.league.name,
        country: country || null
      },
      home_team: transformTeamData(fixture.home_team),
      away_team: transformTeamData(fixture.away_team),
      Event_Broadcasters: fixture.fixturetvstations?.map((ftv: any) => ({
        Broadcasters: transformTvStationData(ftv.tvstation)
      })) || [],
      Odds: transformOdds(fixture.odds || [])
    };
  });
}

export async function getMatchById(matchId: string, supabase = supabaseServer()) {
  const { data: fixture, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      league:leagues(*),
      home_team:teams_new!fixtures_home_team_id_fkey1(*),
      away_team:teams_new!fixtures_away_team_id_fkey1(*),
      fixturetvstations(
        tvstation:tvstations(*)
      ),
      odds(
        id,
        label,
        value,
        market_id,
        bookmaker:bookmakers(*)
      )
    `)
    .eq('id', matchId)
    .single();

  if (error || !fixture) {
    throw new Error('Match not found');
  }

  // Get country data for the league
  const { data: country, error: countryError } = await supabase
    .from('countries')
    .select('*')
    .eq('id', fixture.league.country_id)
    .single();

  if (countryError) {
    console.warn('Could not fetch country for league:', countryError);
  }

  return {
    id: fixture.id,
    name: fixture.name,
    start_time: fixture.starting_at,
    home_score: fixture.home_score,
    away_score: fixture.away_score,
    status: getMatchStatus(fixture.state_id),
    home_team_id: fixture.home_team_id,
    away_team_id: fixture.away_team_id,
    Competitions: {
      id: fixture.league.id,
      name: fixture.league.name,
      country: country || null
    },
    home_team: transformTeamData(fixture.home_team),
    away_team: transformTeamData(fixture.away_team),
    Event_Broadcasters: fixture.fixturetvstations?.map((ftv: any) => ({
      Broadcasters: transformTvStationData(ftv.tvstation)
    })) || [],
    Odds: transformOdds(fixture.odds || [])
  };
}

export async function getAllCompetitions(supabase = supabaseServer()) {
  const { data: leagues, error } = await supabase
    .from('leagues')
    .select(`
      *,
      fixtures(count)
    `)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  // Hardcoded country data from your database
  const countriesMap = new Map([
    [2, { id: 2, name: 'Poland', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/pl.png' }],
    [11, { id: 11, name: 'Germany', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/de.png' }],
    [17, { id: 17, name: 'France', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/fr.png' }],
    [20, { id: 20, name: 'Portugal', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/pt.png' }],
    [32, { id: 32, name: 'Spain', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/es.png' }],
    [38, { id: 38, name: 'Netherlands', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/nl.png' }],
    [41, { id: 41, name: 'Europe', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/eu.png' }],
    [47, { id: 47, name: 'Sweden', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/se.png' }],
    [62, { id: 62, name: 'Switzerland', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/ch.png' }],
    [86, { id: 86, name: 'Ukraine', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/ua.png' }],
    [143, { id: 143, name: 'Austria', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/at.png' }],
    [227, { id: 227, name: 'Russia', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/ru.png' }],
    [251, { id: 251, name: 'Italy', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/it.png' }],
    [266, { id: 266, name: 'Croatia', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/hr.png' }],
    [320, { id: 320, name: 'Denmark', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/dk.png' }],
    [404, { id: 404, name: 'Turkey', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/tr.png' }],
    [462, { id: 462, name: 'England', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/en.png' }],
    [556, { id: 556, name: 'Belgium', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/be.png' }],
    [1161, { id: 1161, name: 'Scotland', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/sc.png' }],
    [1578, { id: 1578, name: 'Norway', image_path: 'https://cdn.sportmonks.com/images/countries/png/short/no.png' }]
  ]);

  return (leagues || []).map((league: any) => ({
    id: league.id,
    name: league.name,
    country: countriesMap.get(league.country_id) || null,
    Events: [{ count: league.fixtures?.[0]?.count || 0 }]
  }));
}

export async function getCompetitionDetails(competitionId: string, supabase = supabaseServer()) {
  const { data: league, error } = await supabase
    .from('leagues')
    .select(`
      *,
      fixtures(
        *,
        home_team:teams_new!fixtures_home_team_id_fkey1(*),
        away_team:teams_new!fixtures_away_team_id_fkey1(*),
        fixturetvstations(
          tvstation:tvstations(*)
        ),
        odds(
          id,
          label,
          value,
          market_id,
          bookmaker:bookmakers(*)
        )
      )
    `)
    .eq('id', competitionId)
    .single();

  if (error || !league) {
    throw new Error('Competition not found');
  }

  return {
    id: league.id,
    name: league.name,
    Events: (league.fixtures || []).map((fixture: any) => ({
      id: fixture.id,
      name: fixture.name,
      start_time: fixture.starting_at,
      home_score: fixture.home_score,
      away_score: fixture.away_score,
      status: getMatchStatus(fixture.state_id),
      home_team: transformTeamData(fixture.home_team),
      away_team: transformTeamData(fixture.away_team),
      Event_Broadcasters: fixture.fixturetvstations?.map((ftv: any) => ({
        Broadcasters: transformTvStationData(ftv.tvstation)
      })) || [],
      Odds: transformOdds(fixture.odds || [])
    }))
  };
}

// Helper functions

export function transformOdds(odds: NewOdds[]): any[] {
  // Transform odds to match the expected format
  // Instead of grouping by market_id, we'll find the best odds for each outcome independently
  const bestOdds = {
    home: { value: null as number | null, operator: null as any, market_id: null as number | null },
    draw: { value: null as number | null, operator: null as any, market_id: null as number | null },
    away: { value: null as number | null, operator: null as any, market_id: null as number | null }
  };
  
  if (!odds || !Array.isArray(odds)) {
    return [];
  }
  
  // Find the best odds for each outcome
  odds.forEach(odd => {
    // Skip if required fields are missing
    if (!odd.label || !odd.bookmaker) {
      return;
    }
    
    const label = odd.label.toLowerCase();
    
    // Check for various label formats: "home"/"Home"/"1", "draw"/"Draw"/"x", "away"/"Away"/"2"
    if ((label === 'home' || label === '1') && (bestOdds.home.value === null || odd.value > bestOdds.home.value)) {
      bestOdds.home = { 
        value: odd.value, 
        operator: transformBookmakerData(odd.bookmaker),
        market_id: odd.market_id
      };
    }
    if ((label === 'draw' || label === 'x') && (bestOdds.draw.value === null || odd.value > bestOdds.draw.value)) {
      bestOdds.draw = { 
        value: odd.value, 
        operator: transformBookmakerData(odd.bookmaker),
        market_id: odd.market_id
      };
    }
    if ((label === 'away' || label === '2') && (bestOdds.away.value === null || odd.value > bestOdds.away.value)) {
      bestOdds.away = { 
        value: odd.value, 
        operator: transformBookmakerData(odd.bookmaker),
        market_id: odd.market_id
      };
    }
  });
  
  // Create separate market objects for each outcome that has odds
  const result = [];
  
  if (bestOdds.home.value !== null) {
    result.push({
      id: bestOdds.home.market_id,
      fixture_id: odds[0]?.fixture_id,
      home_win: bestOdds.home.value,
      Operators: bestOdds.home.operator
    });
  }
  
  if (bestOdds.draw.value !== null) {
    result.push({
      id: bestOdds.draw.market_id,
      fixture_id: odds[0]?.fixture_id,
      draw: bestOdds.draw.value,
      Operators: bestOdds.draw.operator
    });
  }
  
  if (bestOdds.away.value !== null) {
    result.push({
      id: bestOdds.away.market_id,
      fixture_id: odds[0]?.fixture_id,
      away_win: bestOdds.away.value,
      Operators: bestOdds.away.operator
    });
  }
  
  return result;
}

export function getBestOdds(odds: NewOdds[]) {
  const best = {
    home: { value: null as number | null, operator: null as any },
    draw: { value: null as number | null, operator: null as any },
    away: { value: null as number | null, operator: null as any }
  };

  if (!odds || !Array.isArray(odds)) {
    return best;
  }

  for (const odd of odds) {
    // Skip if required fields are missing
    if (!odd.label || !odd.bookmaker) {
      continue;
    }
    
    const label = odd.label.toLowerCase();
    
    // Check for various label formats: "home"/"Home"/"1", "draw"/"Draw"/"x", "away"/"Away"/"2"
    if ((label === 'home' || label === '1') && (best.home.value === null || odd.value > best.home.value)) {
      best.home = { value: odd.value, operator: odd.bookmaker };
    }
    if ((label === 'draw' || label === 'x') && (best.draw.value === null || odd.value > best.draw.value)) {
      best.draw = { value: odd.value, operator: odd.bookmaker };
    }
    if ((label === 'away' || label === '2') && (best.away.value === null || odd.value > best.away.value)) {
      best.away = { value: odd.value, operator: odd.bookmaker };
    }
  }
  
  return best;
}

// New function to get best odds from transformed odds format
export function getBestOddsFromTransformed(transformedOdds: any[]) {
  const best = {
    home: { value: null as number | null, operator: null as any },
    draw: { value: null as number | null, operator: null as any },
    away: { value: null as number | null, operator: null as any }
  };

  if (!transformedOdds || !Array.isArray(transformedOdds)) {
    return best;
  }

  // With the new structure, each market object contains the best odds for one outcome
  for (const market of transformedOdds) {
    // Each market now contains only one outcome type with the best odds
    if (market.home_win) {
      best.home = { value: market.home_win, operator: market.Operators };
    }
    if (market.draw) {
      best.draw = { value: market.draw, operator: market.Operators };
    }
    if (market.away_win) {
      best.away = { value: market.away_win, operator: market.Operators };
    }
  }
  
  return best;
} 

export async function getTeamForm(teamId: number, beforeDate: string, supabase = supabaseBrowser) {
  try {
    console.log('Fetching team form for:', { teamId, beforeDate });
    
    // Fetch the last 5 matches for this team before the given date
    const { data: fixtures, error } = await supabase
      .from('fixtures')
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        starting_at,
        home_team:teams_new!fixtures_home_team_id_fkey1(name),
        away_team:teams_new!fixtures_away_team_id_fkey1(name)
      `)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .lt('starting_at', beforeDate)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .order('starting_at', { ascending: false })
      .limit(5);

    // Also check total matches for this team (for debugging)
    const { data: totalMatches, error: totalError } = await supabase
      .from('fixtures')
      .select('id, starting_at')
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .order('starting_at', { ascending: false });

    console.log(`Total matches for team ${teamId}:`, totalMatches?.length || 0);
    console.log(`Matches before ${beforeDate}:`, fixtures?.length || 0);
    console.log('All matches for this team:', totalMatches?.map((m: any) => ({ id: m.id, date: m.starting_at })));
    console.log('Date comparison - beforeDate:', beforeDate, 'type:', typeof beforeDate);

    console.log('Team form query result:', { fixtures, error, count: fixtures?.length });
    console.log('Raw fixtures data:', fixtures);
    console.log('Query details:', {
      teamId,
      beforeDate,
      query: `SELECT * FROM fixtures WHERE (home_team_id = ${teamId} OR away_team_id = ${teamId}) AND starting_at < '${beforeDate}' AND home_score IS NOT NULL AND away_score IS NOT NULL ORDER BY starting_at DESC LIMIT 5`
    });

    if (error) {
      console.error('Error fetching team form:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // If it's a permission error, return empty results (will show grey circles)
      if (error.code === '42501') {
        console.log('Database permission denied - showing grey circles for form');
        return [];
      }
      
      return [];
    }

    if (!fixtures) return [];

    // Transform the data to determine result for the team
    const formResults = fixtures.map((fixture: any) => {
      const isHomeTeam = fixture.home_team_id === teamId;
      const teamName = isHomeTeam ? fixture.home_team?.name : fixture.away_team?.name;
      const opponentName = isHomeTeam ? fixture.away_team?.name : fixture.home_team?.name;
      
      let result: 'win' | 'draw' | 'loss' | null = null;
      
      if (fixture.home_score !== null && fixture.away_score !== null) {
        if (isHomeTeam) {
          if (fixture.home_score > fixture.away_score) result = 'win';
          else if (fixture.home_score < fixture.away_score) result = 'loss';
          else result = 'draw';
        } else {
          if (fixture.away_score > fixture.home_score) result = 'win';
          else if (fixture.away_score < fixture.home_score) result = 'loss';
          else result = 'draw';
        }
      }

      return {
        result,
        opponent: opponentName || 'Unknown',
        matchUrl: `/match/${fixture.id}-${teamName?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${opponentName?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        date: fixture.starting_at
      };
    });

    console.log('Transformed form results:', formResults);
    return formResults;
  } catch (error) {
    console.error('Error in getTeamForm:', error);
    return [];
  }
} 