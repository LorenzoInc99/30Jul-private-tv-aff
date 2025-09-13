import { supabaseServer } from '../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamDetailsClient from './TeamDetailsClient';
import { SITE_TITLE } from '../../../lib/constants';
import { slugify } from '../../../lib/utils';

// Generic team lookup function that works for all teams
async function findTeamByName(teamNameSlug: string) {
  const supabase = supabaseServer();
  
  // Strategy 1: Get all teams and find the one that slugifies to our target
  const { data: allTeams } = await supabase
    .from('teams_new')
    .select('*')
    .limit(1000); // Get a reasonable number of teams
  
  if (allTeams) {
    // Find the team whose slugified name matches our target
    const matchingTeam = allTeams.find((team: any) => {
      const teamSlug = slugify(team.name);
      return teamSlug === teamNameSlug;
    });
    
    if (matchingTeam) {
      return matchingTeam;
    }
  }
  
  // Strategy 2: Try exact match first (fallback)
  let { data: team } = await supabase
    .from('teams_new')
    .select('*')
    .ilike('name', teamNameSlug)
    .single();
  
  if (team) return team;
  
  // Strategy 3: Try with common prefixes and variations
  const variations = [
    // Add common prefixes
    `FC ${teamNameSlug}`,
    `FCK ${teamNameSlug}`,
    `FK ${teamNameSlug}`,
    // Try with spaces (camelCase to spaces)
    teamNameSlug.replace(/([a-z])([A-Z])/g, '$1 $2'),
    // Try with common team name patterns
    teamNameSlug.replace(/united/i, ' United'),
    teamNameSlug.replace(/city/i, ' City'),
    teamNameSlug.replace(/athletic/i, ' Athletic'),
    teamNameSlug.replace(/real/i, 'Real '),
    teamNameSlug.replace(/atletico/i, 'Atlético '),
    // Try with common suffixes
    `${teamNameSlug} FC`,
    `${teamNameSlug} United`,
    `${teamNameSlug} City`,
  ];
  
  for (const variation of variations) {
    const { data } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', variation)
      .single();
    if (data) return data;
  }
  
  // Strategy 4: Try partial matches with fuzzy search
  const { data: partialMatches } = await supabase
    .from('teams_new')
    .select('*')
    .or(`name.ilike.%${teamNameSlug}%,name.ilike.${teamNameSlug}%`)
    .limit(10);
  
  if (partialMatches && partialMatches.length > 0) {
    // Find the best match by comparing slugified names
    const bestMatch = partialMatches.find((t: any) => {
      const teamSlug = slugify(t.name);
      return teamSlug === teamNameSlug || 
             teamSlug.includes(teamNameSlug) || 
             teamNameSlug.includes(teamSlug);
    });
    
    if (bestMatch) return bestMatch;
    
    // If no exact slug match, return the first partial match
    return partialMatches[0];
  }
  
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ teamName: string }> }): Promise<Metadata> {
  const { teamName } = await params;
  
  const team = await findTeamByName(teamName);
  
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

export default async function TeamPage({ params }: { params: Promise<{ teamName: string }> }) {
  const { teamName } = await params;
  
  const team = await findTeamByName(teamName);
  
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

  // Get next match for this team (scheduled, not finished)
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

  const nextMatchWithCountry = nextMatch ? addCountryToMatch(nextMatch) : null;
  const previousMatchesWithCountry = previousMatches ? previousMatches.map(addCountryToMatch) : [];

  return (
    <TeamDetailsClient 
      team={team} 
      nextMatch={nextMatchWithCountry} 
      previousMatches={previousMatchesWithCountry} 
    />
  );
} 