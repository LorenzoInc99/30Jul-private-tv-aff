import { supabaseBrowser, supabaseServer } from './supabase';
import { getMatchStatus, transformTeamData, transformTvStationData, transformBookmakerData } from './database-config';
import { ProviderFactory } from './providers/provider-factory';

// Helper function to fetch countries from database
async function getCountriesMap(supabase: any) {
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, name, image_path')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching countries:', error);
    // Fallback to empty map if database query fails
    return new Map();
  }

  // Create countries map for efficient lookup
  const countriesMap = new Map();
  (countries || []).forEach((country: any) => {
    countriesMap.set(country.id, {
      id: country.id,
      name: country.name,
      image_path: country.image_path || null
    });
  });

  return countriesMap;
}

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
  // Use UTC time to match the database timestamps
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0));

  // Fetch fixtures with all related data using separate queries to avoid JOIN issues
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      league:leagues(*),
      home_team:teams_new!fixtures_home_team_id_fkey1(*),
      away_team:teams_new!fixtures_away_team_id_fkey1(*),
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

  // Fetch TV stations separately to avoid JOIN issues
  const fixtureIds = (fixtures || []).map((f: any) => f.id);
  let tvStationsData: any[] = [];
  
  if (fixtureIds.length > 0) {
    const { data: tvData, error: tvError } = await supabase
      .from('fixturetvstations')
      .select(`
        fixture_id,
        tvstation:tvstations(*)
      `)
      .in('fixture_id', fixtureIds);
    
    if (!tvError && tvData) {
      tvStationsData = tvData;
    }
  }

  // Group TV stations by fixture_id
  const tvStationsByFixture = new Map();
  for (const tvData of tvStationsData) {
    if (!tvStationsByFixture.has(tvData.fixture_id)) {
      tvStationsByFixture.set(tvData.fixture_id, []);
    }
    tvStationsByFixture.get(tvData.fixture_id).push(tvData.tvstation);
  }

  // Fetch countries from database
  const countriesMap = await getCountriesMap(supabase);

  // Transform to expected frontend format
  return (fixtures || []).map((fixture: any) => {
    const country = countriesMap.get(fixture.league.country_id);
    const fixtureTvStations = tvStationsByFixture.get(fixture.id) || [];
    
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
        country: country || null,
        league_logo: fixture.league.league_logo || null
      },
      home_team: transformTeamData(fixture.home_team),
      away_team: transformTeamData(fixture.away_team),
      Event_Broadcasters: fixtureTvStations.map((tvstation: any) => ({
        Broadcasters: transformTvStationData(tvstation)
      })),
      Odds: transformOddsByBookmaker(fixture.odds || [])
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
        country: country || null,
        league_logo: fixture.league.league_logo || null
      },
    home_team: transformTeamData(fixture.home_team),
    away_team: transformTeamData(fixture.away_team),
    Event_Broadcasters: fixture.fixturetvstations?.map((ftv: any) => ({
      Broadcasters: transformTvStationData(ftv.tvstation)
    })) || [],
    Odds: transformOddsByBookmaker(fixture.odds || [])
  };
}

export async function getAllCompetitions(supabase = supabaseServer()) {
  // Fetch countries from database
  const countriesMap = await getCountriesMap(supabase);

  // Fetch leagues with fixture counts
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
    country: countriesMap.get(league.country_id) || null,
    league_logo: league.league_logo || null,
    Events: [{ count: league.fixtures?.[0]?.count || 0 }]
  }));
}

export async function getCompetitionDetails(competitionId: string, supabase = supabaseServer()) {
  // Fetch countries from database
  const countriesMap = await getCountriesMap(supabase);

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
    country: countriesMap.get(league.country_id) || null,
    league_logo: league.league_logo || null,
    Events: (league.fixtures || [])
      .map((fixture: any) => ({
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
        Odds: transformOddsByBookmaker(fixture.odds || [])
      }))
      .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) // Sort by date ascending (oldest first)
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

export async function getTeamForm(teamId: number, beforeDate: string, supabase = supabaseBrowser) {
  try {
    console.log('Fetching team form for:', { teamId, beforeDate, supabaseType: typeof supabase });
    
    // Validate inputs
    if (!teamId || !beforeDate) {
      console.warn('Invalid inputs for getTeamForm:', { teamId, beforeDate });
      return [];
    }
    
    // Fetch the last 5 matches for this team before the given date
    console.log('Executing team form query for teamId:', teamId);
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
    
    console.log('Query completed. Fixtures count:', fixtures?.length || 0, 'Error:', error ? 'Yes' : 'No');

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
      console.error('Error fetching team form:', {
        message: error.message || 'Unknown error',
        code: error.code || 'No code',
        details: error.details || 'No details',
        hint: error.hint || 'No hint'
      });
      
      // If it's a permission error or any other error, return empty results (will show grey circles)
      console.log('Database error - showing grey circles for form');
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
    console.error('Error in getTeamForm:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error
    });
    return [];
  }
} 

export async function getAllBookmakers(supabase = supabaseServer()) {
  try {
    const { data: bookmakers, error } = await supabase
      .from('bookmakers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching bookmakers:', error);
      return [];
    }

    return bookmakers || [];
  } catch (error) {
    console.error('Error in getAllBookmakers:', error);
    return [];
  }
} 

export function transformOddsByBookmaker(odds: NewOdds[]): any[] {
  if (!odds || !Array.isArray(odds)) {
    return [];
  }

  // Group odds by bookmaker
  const oddsByBookmaker = new Map();

  odds.forEach(odd => {
    if (!odd.label || !odd.bookmaker) {
      return;
    }

    const bookmakerId = odd.bookmaker.id;
    const label = odd.label.toLowerCase();

    if (!oddsByBookmaker.has(bookmakerId)) {
      oddsByBookmaker.set(bookmakerId, {
        Operators: transformBookmakerData(odd.bookmaker),
        home_win: null,
        draw: null,
        away_win: null
      });
    }

    const bookmakerOdds = oddsByBookmaker.get(bookmakerId);

    // Assign odds to the correct outcome
    if (label === 'home' || label === '1') {
      bookmakerOdds.home_win = odd.value;
    } else if (label === 'draw' || label === 'x') {
      bookmakerOdds.draw = odd.value;
    } else if (label === 'away' || label === '2') {
      bookmakerOdds.away_win = odd.value;
    }
  });

  return Array.from(oddsByBookmaker.values());
}

// New provider-based functions for API abstraction
export async function getMatchesForDateViaProvider(date: Date) {
  const provider = ProviderFactory.getProvider();
  return await provider.getMatchesForDate(date);
}

export async function getMatchByIdViaProvider(id: string) {
  const provider = ProviderFactory.getProvider();
  return await provider.getMatchById(id);
}

export async function getTeamByIdViaProvider(id: string) {
  const provider = ProviderFactory.getProvider();
  return await provider.getTeamById(id);
}

export async function getLeagueByIdViaProvider(id: string) {
  const provider = ProviderFactory.getProvider();
  return await provider.getLeagueById(id);
} 