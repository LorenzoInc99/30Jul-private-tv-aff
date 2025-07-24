import { supabaseServer } from '../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompetitionDetailsClient from './CompetitionDetailsClient';
import { SITE_TITLE } from '../../../lib/constants';
import Head from 'next/head';

function extractCompetitionId(competitionSlug: string) {
  // First try to extract UUID (36 characters: 8-4-4-4-12 format)
  const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;
  const uuidMatch = competitionSlug.match(uuidPattern);
  if (uuidMatch) return uuidMatch[1];
  
  // If not UUID, try to extract numeric ID at the beginning
  const numericPattern = /^(\d+)/;
  const numericMatch = competitionSlug.match(numericPattern);
  if (numericMatch) return numericMatch[1];
  
  // Fallback to the entire slug
  return competitionSlug;
}

export async function generateMetadata({ params }: { params: Promise<{ competitionSlug: string }> }): Promise<Metadata> {
  const { competitionSlug } = await params;
  const competitionId = extractCompetitionId(competitionSlug);
  const supabase = supabaseServer();
  
  const { data: competition } = await supabase
    .from('Competitions')
    .select('*')
    .eq('id', competitionId)
    .single();

  if (!competition) return { title: 'Competition Not Found' };

  return {
    title: `${competition.name} - Live Matches & Fixtures`,
    description: `Get the complete ${competition.name} schedule, live matches, broadcasters, and betting odds. Never miss a ${competition.name} game!`,
  };
}

export default async function CompetitionPage({ params }: { params: Promise<{ competitionSlug: string }> }) {
  const { competitionSlug } = await params;
  const competitionId = extractCompetitionId(competitionSlug);
  const supabase = supabaseServer();
  
  // Get competition details
  const { data: competition } = await supabase
    .from('Competitions')
    .select('*')
    .eq('id', competitionId)
    .single();

  if (!competition) return notFound();

  // Get all matches for this competition (upcoming and recent)
  const { data: matches } = await supabase
    .from('Events')
    .select(`*, status, home_team: Teams!Events_home_team_id_fkey(*), away_team: Teams!Events_away_team_id_fkey(*), Event_Broadcasters(Broadcasters(*)), Odds(*, Operators(*))`)
    .eq('competition_id', competitionId)
    .order('start_time', { ascending: true });

  const canonicalUrl = `https://your-domain.com/competition/${competition.id}-${competition.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
  const description = `Get the complete ${competition.name} schedule, live matches, broadcasters, and betting odds. Never miss a ${competition.name} game!`;
  const keywords = `${competition.name}, football, soccer, fixtures, schedule, odds, broadcasters`;

  return (
    <>
      <Head>
        <title>{`${competition.name} - Live Matches & Fixtures | Live Football TV Guide`}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${competition.name} - Live Matches & Fixtures | Live Football TV Guide`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${competition.name} - Live Matches & Fixtures | Live Football TV Guide`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/og-image.jpg" />
      </Head>
      <CompetitionDetailsClient competition={competition} matches={matches || []} />
    </>
  );
} 