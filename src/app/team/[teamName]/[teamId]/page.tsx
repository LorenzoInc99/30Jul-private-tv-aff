import { supabaseServer } from '../../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamDetailsClient from '../TeamDetailsClient';
import { SITE_TITLE } from '../../../../lib/constants';

// Fast team lookup using ID only
async function findTeamById(teamId: string) {
  const supabase = supabaseServer();
  
  const { data: team, error } = await supabase
    .from('teams_new')
    .select('*')
    .eq('id', teamId)
    .single();
  
  if (error) {
    console.error('Error fetching team by ID:', error);
    return null;
  }
  
  return team;
}

export async function generateMetadata({ params }: { params: Promise<{ teamName: string; teamId: string }> }): Promise<Metadata> {
  const { teamId } = await params;
  
  const team = await findTeamById(teamId);
  
  if (!team) return { title: 'Team Not Found' };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const description = `Get ${team.name} team profile, recent matches, upcoming fixtures, and live betting odds. Follow ${team.name} performance, results, and find where to watch their games on ${dateString}. Complete team statistics and match schedules.`;
  
  return {
    title: `${team.name} - Team Profile, Matches & Stats`,
    description,
    keywords: `${team.name}, football team, soccer, matches, fixtures, players, stats, betting odds, ${dateString}`,
    openGraph: {
      title: `${team.name} - Team Profile, Matches & Stats`,
      description,
      type: 'website',
    },
    twitter: {
      title: `${team.name} - Team Profile, Matches & Stats`,
      description,
    },
  };
}

export default async function TeamPage({ params }: { params: Promise<{ teamName: string; teamId: string }> }) {
  const { teamId } = await params;
  
  const team = await findTeamById(teamId);
  
  if (!team) {
    return notFound();
  }

  const supabase = supabaseServer();

  // Fetch countries separately to avoid join issues
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name')
    .order('name', { ascending: true });
  
  // Create a map of country_id to country_name
  const countriesMap = new Map();
  if (countries) {
    countries.forEach((country: any) => {
      countriesMap.set(country.id, country.name);
    });
  }

  // Get today's match for this team (if any)
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const { data: todayMatch } = await supabase
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
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .gte('starting_at', todayStart.toISOString())
    .lt('starting_at', todayEnd.toISOString())
    .order('starting_at', { ascending: true })
    .limit(1)
    .single();

  // Get next match for this team (scheduled, not finished) - only if no today match
  const { data: nextMatch } = await supabase
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
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .gte('starting_at', new Date().toISOString())
    .order('starting_at', { ascending: true })
    .limit(1)
    .single();

  // Get upcoming matches (3-5 matches) for better planning
  const { data: upcomingMatches } = await supabase
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
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .gte('starting_at', new Date().toISOString())
    .order('starting_at', { ascending: true })
    .limit(5);

  // Get previous matches for this team (finished matches)
  const { data: previousMatches } = await supabase
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
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .in('state_id', [5, 7, 8]) // Finished matches: Full Time, After Extra Time, After Penalties
    .order('starting_at', { ascending: false })
    .limit(10);

  // Add country information to matches
  const addCountryToMatch = (match: any) => {
    if (match?.league) {
      return {
        ...match,
        league: {
          ...match.league,
          country: {
            id: match.league.country_id,
            name: countriesMap.get(match.league.country_id) || 'Unknown'
          }
        }
      };
    }
    return match;
  };

  // Calculate team form from last 5 matches
  const calculateTeamForm = (matches: any[]) => {
    const last5Matches = matches.slice(0, 5);
    let wins = 0, draws = 0, losses = 0;
    let goalsFor = 0, goalsAgainst = 0;
    const formResults: string[] = [];

    last5Matches.forEach((match) => {
      if (match.home_score !== null && match.away_score !== null) {
        const isHomeTeam = match.home_team_id === team.id;
        const teamScore = isHomeTeam ? match.home_score : match.away_score;
        const opponentScore = isHomeTeam ? match.away_score : match.home_score;
        
        goalsFor += teamScore;
        goalsAgainst += opponentScore;
        
        let result: string;
        if (teamScore > opponentScore) {
          wins++;
          result = 'W';
        } else if (teamScore === opponentScore) {
          draws++;
          result = 'D';
        } else {
          losses++;
          result = 'L';
        }
        formResults.push(result);
      }
    });

    return {
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      formResults: formResults.reverse() // Most recent first
    };
  };

  const teamForm = calculateTeamForm(previousMatches || []);

  const nextMatchWithCountry = nextMatch ? addCountryToMatch(nextMatch) : null;
  const upcomingMatchesWithCountry = upcomingMatches ? upcomingMatches.map(addCountryToMatch) : [];
  const previousMatchesWithCountry = previousMatches ? previousMatches.map(addCountryToMatch) : [];

  return (
    <TeamDetailsClient 
      team={team} 
      nextMatch={nextMatchWithCountry}
      todayMatch={todayMatch ? addCountryToMatch(todayMatch) : null}
      upcomingMatches={upcomingMatchesWithCountry}
      previousMatches={previousMatchesWithCountry}
      teamForm={teamForm}
    />
  );
}
