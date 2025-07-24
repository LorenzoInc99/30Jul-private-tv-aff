import { supabaseServer } from '../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamDetailsClient from './TeamDetailsClient';
import { SITE_TITLE } from '../../../lib/constants';
import Head from 'next/head';

function extractTeamId(teamSlug: string) {
  // First try to extract UUID (36 characters: 8-4-4-4-12 format)
  const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;
  const uuidMatch = teamSlug.match(uuidPattern);
  if (uuidMatch) return uuidMatch[1];
  
  // If not UUID, try to extract numeric ID at the beginning
  const numericPattern = /^(\d+)/;
  const numericMatch = teamSlug.match(numericPattern);
  if (numericMatch) return numericMatch[1];
  
  // Fallback to the entire slug
  return teamSlug;
}

export async function generateMetadata({ params }: { params: Promise<{ teamSlug: string }> }): Promise<Metadata> {
  const { teamSlug } = await params;
  const teamId = extractTeamId(teamSlug);
  const supabase = supabaseServer();
  
  const { data: team } = await supabase
    .from('Teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (!team) return { title: 'Team Not Found' };

  return {
    title: `${team.name} - Team Profile, Matches & Stats`,
    description: `Get ${team.name} team profile, recent matches, upcoming fixtures, players, stats, and live betting odds. Follow ${team.name} performance and results!`,
    keywords: `${team.name}, football team, soccer, matches, fixtures, players, stats, betting odds`,
  };
}

export default async function TeamPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const { teamSlug } = await params;
  const teamId = extractTeamId(teamSlug);
  const supabase = supabaseServer();
  
  // Get team details
  const { data: team } = await supabase
    .from('Teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (!team) return notFound();

  // Get all matches for this team (both home and away)
  const { data: matches } = await supabase
    .from('Events')
    .select(`*, status, home_team: Teams!Events_home_team_id_fkey(*), away_team: Teams!Events_away_team_id_fkey(*), competition: Competitions(*), Event_Broadcasters(Broadcasters(*)), Odds(*, Operators(*))`)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('start_time', { ascending: true });

  const canonicalUrl = `https://your-domain.com/team/${team.id}-${team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
  const description = `Get ${team.name} team profile, recent matches, upcoming fixtures, players, stats, and live betting odds. Follow ${team.name} performance and results!`;
  const keywords = `${team.name}, football team, soccer, matches, fixtures, players, stats, betting odds`;

  return (
    <>
      <Head>
        <title>{`${team.name} - Team Profile, Matches & Stats | Live Football TV Guide`}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${team.name} - Team Profile, Matches & Stats | Live Football TV Guide`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={team.logo_url || '/og-image.jpg'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${team.name} - Team Profile, Matches & Stats | Live Football TV Guide`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={team.logo_url || '/og-image.jpg'} />
      </Head>
      <TeamDetailsClient team={team} matches={matches || []} />
    </>
  );
} 