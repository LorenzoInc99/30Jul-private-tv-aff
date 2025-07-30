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

  // Transform to expected frontend format
  return (fixtures || []).map((fixture: any) => ({
    id: fixture.id,
    name: fixture.name,
    start_time: fixture.starting_at,
    home_score: fixture.home_score,
    away_score: fixture.away_score,
    status: getMatchStatus(fixture.state_id),
    Competitions: {
      id: fixture.league.id,
      name: fixture.league.name
    },
    home_team: transformTeamData(fixture.home_team),
    away_team: transformTeamData(fixture.away_team),
    Event_Broadcasters: fixture.fixturetvstations?.map((ftv: any) => ({
      Broadcasters: transformTvStationData(ftv.tvstation)
    })) || [],
    Odds: transformOdds(fixture.odds || [])
  }));
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

  return {
    id: fixture.id,
    name: fixture.name,
    start_time: fixture.starting_at,
    home_score: fixture.home_score,
    away_score: fixture.away_score,
    status: getMatchStatus(fixture.state_id),
    Competitions: {
      id: fixture.league.id,
      name: fixture.league.name
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

  return (leagues || []).map((league: any) => ({
    id: league.id,
    name: league.name,
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
  // Group by market_id and create the expected structure
  const oddsByMarket: { [key: number]: any } = {};
  
  if (!odds || !Array.isArray(odds)) {
    return [];
  }
  
  odds.forEach(odd => {
    // Skip if required fields are missing
    if (!odd.label || !odd.market_id || !odd.bookmaker) {
      return;
    }
    
    if (!oddsByMarket[odd.market_id]) {
      oddsByMarket[odd.market_id] = {
        id: odd.id,
        fixture_id: odd.fixture_id,
        Operators: transformBookmakerData(odd.bookmaker)
      };
    }
    
    const label = odd.label.toLowerCase();
    
    // Map odds based on label - handle various formats including capitalized versions
    if (label === '1' || label === 'home') {
      oddsByMarket[odd.market_id].home_win = odd.value;
    } else if (label === 'x' || label === 'draw') {
      oddsByMarket[odd.market_id].draw = odd.value;
    } else if (label === '2' || label === 'away') {
      oddsByMarket[odd.market_id].away_win = odd.value;
    }
  });
  
  return Object.values(oddsByMarket);
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

  for (const market of transformedOdds) {
    // Check if this market has better odds for any outcome
    if (market.home_win && (best.home.value === null || market.home_win > best.home.value)) {
      best.home = { value: market.home_win, operator: market.Operators };
    }
    if (market.draw && (best.draw.value === null || market.draw > best.draw.value)) {
      best.draw = { value: market.draw, operator: market.Operators };
    }
    if (market.away_win && (best.away.value === null || market.away_win > best.away.value)) {
      best.away = { value: market.away_win, operator: market.Operators };
    }
  }
  
  return best;
} 