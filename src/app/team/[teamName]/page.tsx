import { supabaseServer } from '../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamDetailsClient from './TeamDetailsClient';
import { SITE_TITLE } from '../../../lib/constants';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateMetadata({ params }: { params: Promise<{ teamName: string }> }): Promise<Metadata> {
  const { teamName } = await params;
  const supabase = supabaseServer();
  
  // Convert slug back to team name
  const teamNameFromSlug = teamName.replace(/-/g, ' ');
  
  const { data: team } = await supabase
    .from('teams_new')
    .select('*')
    .ilike('name', `%${teamNameFromSlug}%`)
    .single();

  if (!team) return { title: 'Team Not Found' };

  return {
    title: `${team.name} - Team Profile, Matches & Stats`,
    description: `Get ${team.name} team profile, recent matches, upcoming fixtures, players, stats, and live betting odds. Follow ${team.name} performance and results!`,
    keywords: `${team.name}, football team, soccer, matches, fixtures, players, stats, betting odds`,
  };
}

export default async function TeamPage({ params }: { params: Promise<{ teamName: string }> }) {
  const { teamName } = await params;
  const supabase = supabaseServer();
  
  // Convert slug back to team name
  const teamNameFromSlug = teamName.replace(/-/g, ' ');
  
  console.log('Looking for team with slug:', teamName);
  console.log('Converted to search term:', teamNameFromSlug);
  
  // Get team details
  const { data: team, error } = await supabase
    .from('teams_new')
    .select('*')
    .ilike('name', `%${teamNameFromSlug}%`)
    .single();
    
  console.log('Team lookup result:', { team, error });

  if (!team) return notFound();

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

  const canonicalUrl = `https://your-domain.com/team/${slugify(team.name)}`;
  const description = `Get ${team.name} team profile, recent matches, upcoming fixtures, players, stats, and live betting odds. Follow ${team.name} performance and results!`;
  const keywords = `${team.name}, football team, soccer, matches, fixtures, players, stats, betting odds`;

  return (
    <TeamDetailsClient 
      team={team} 
      nextMatch={nextMatch} 
      previousMatches={previousMatches || []} 
    />
  );
} 