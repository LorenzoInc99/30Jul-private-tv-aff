import { supabaseServer } from '../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamDetailsClient from './TeamDetailsClient';
import { SITE_TITLE } from '../../../lib/constants';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export async function generateMetadata({ params }: { params: Promise<{ teamName: string }> }): Promise<Metadata> {
  const { teamName } = await params;
  const supabase = supabaseServer();
  
  // Convert slug back to team name - handle special characters
  const teamNameFromSlug = teamName.replace(/-/g, ' ');
  
  // Also try with common character replacements for better matching
  const alternativeSearchTerms = [
    teamNameFromSlug,
    teamNameFromSlug.replace(/o/g, 'ø'),
    teamNameFromSlug.replace(/ae/g, 'æ'),
    teamNameFromSlug.replace(/aa/g, 'å'),
    teamNameFromSlug.replace(/oe/g, 'ö'),
    teamNameFromSlug.replace(/ue/g, 'ü'),
    teamNameFromSlug.replace(/ss/g, 'ß'),
  ];
  
  // Try to find team with multiple search terms
  let team = null;
  for (const searchTerm of alternativeSearchTerms) {
    const { data } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .single();
    if (data) {
      team = data;
      break;
    }
  }

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
  
  // Convert slug back to team name - handle special characters
  const teamNameFromSlug = teamName.replace(/-/g, ' ');
  
  // Also try with common character replacements for better matching
  const alternativeSearchTerms = [
    teamNameFromSlug,
    teamNameFromSlug.replace(/o/g, 'ø'),
    teamNameFromSlug.replace(/ae/g, 'æ'),
    teamNameFromSlug.replace(/aa/g, 'å'),
    teamNameFromSlug.replace(/oe/g, 'ö'),
    teamNameFromSlug.replace(/ue/g, 'ü'),
    teamNameFromSlug.replace(/ss/g, 'ß'),
  ];
  
  console.log('Looking for team with slug:', teamName);
  console.log('Converted to search terms:', alternativeSearchTerms);
  
  // Try to find team with multiple search terms
  let team = null;
  let error = null;
  for (const searchTerm of alternativeSearchTerms) {
    const { data, err } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .single();
    if (data) {
      team = data;
      break;
    }
    if (err) error = err;
  }
    
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