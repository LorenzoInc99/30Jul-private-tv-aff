import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import Link from 'next/link';
import { SITE_TITLE } from '@/lib/constants';
import MatchDetails from '@/components/MatchDetails';
import Head from 'next/head';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PageProps {
  params: Promise<{ matchId: string }>;
}

function extractMatchId(slug: string): string {
  // Handle both UUID and slug formats
  const uuidMatch = slug.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  // If no UUID found, try to extract numeric ID
  const numericMatch = slug.match(/^(\d+)/);
  if (numericMatch) {
    return numericMatch[1];
  }
  return slug;
}

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params;
  const actualMatchId = extractMatchId(matchId);
  const { data: match } = await supabaseServer()
    .from('Events')
    .select(`*, Competitions(*), home_team: Teams!Events_home_team_id_fkey(*), away_team: Teams!Events_away_team_id_fkey(*)`)
    .eq('id', actualMatchId)
    .single();
  if (!match) {
    return {
      title: 'Match Not Found',
      description: 'The requested match could not be found.',
    };
  }
  const matchTitle = `${match.home_team?.name} vs ${match.away_team?.name}`;
  const competitionName = match.Competitions?.name || 'Football Match';
  return {
    title: `${matchTitle} - ${competitionName} | ${SITE_TITLE}`,
    description: `Watch ${matchTitle} live on TV. Get match details, betting odds, and broadcast information for this ${competitionName} fixture.`,
  };
}

export default async function MatchPage({ params }: PageProps) {
  const { matchId } = await params;
  const actualMatchId = extractMatchId(matchId);
  const { data: match, error } = await supabaseServer()
    .from('Events')
    .select(`*, status, Competitions(*), home_team: Teams!Events_home_team_id_fkey(*), away_team: Teams!Events_away_team_id_fkey(*), Event_Broadcasters(Broadcasters(id, name, logo_url, affiliate_url)), Odds(*, Operators(*))`)
    .eq('id', actualMatchId)
    .single();
  if (error || !match) {
    notFound();
  }
  return (
    <>
      <Head>
        <link rel="canonical" href={`https://your-domain.com/match/${actualMatchId}`} />
        <title>{`${match.home_team?.name} vs ${match.away_team?.name} - ${match.Competitions?.name} | Live Football TV Guide`}</title>
        <meta name="description" content={`Watch ${match.home_team?.name} vs ${match.away_team?.name} live on TV. Get match details, betting odds, and broadcast information for this ${match.Competitions?.name} fixture.`} />
        <meta name="keywords" content={`${match.home_team?.name}, ${match.away_team?.name}, ${match.Competitions?.name}, football, soccer, match, odds, broadcasters`} />
        <meta property="og:title" content={`${match.home_team?.name} vs ${match.away_team?.name} - ${match.Competitions?.name} | Live Football TV Guide`} />
        <meta property="og:description" content={`Watch ${match.home_team?.name} vs ${match.away_team?.name} live on TV. Get match details, betting odds, and broadcast information for this ${match.Competitions?.name} fixture.`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://your-domain.com/match/${actualMatchId}`} />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${match.home_team?.name} vs ${match.away_team?.name} - ${match.Competitions?.name} | Live Football TV Guide`} />
        <meta name="twitter:description" content={`Watch ${match.home_team?.name} vs ${match.away_team?.name} live on TV. Get match details, betting odds, and broadcast information for this ${match.Competitions?.name} fixture.`} />
        <meta name="twitter:image" content="/og-image.jpg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'http://schema.org',
          '@type': 'SportsEvent',
          'name': `${match.home_team?.name} vs ${match.away_team?.name}`,
          'startDate': match.start_time,
          'location': {
            '@type': 'Place',
            'name': match.Competitions?.name
          },
          'performer': [
            { '@type': 'SportsTeam', 'name': match.home_team?.name },
            { '@type': 'SportsTeam', 'name': match.away_team?.name }
          ],
          'eventStatus': match.status,
          'url': `https://your-domain.com/match/${actualMatchId}`,
          'description': `Watch ${match.home_team?.name} vs ${match.away_team?.name} live on TV. Get match details, betting odds, and broadcast information for this ${match.Competitions?.name} fixture.`
        }) }} />
      </Head>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <div className="w-full md:max-w-3xl mx-auto flex-grow">
          <Breadcrumbs
            items={[
              { name: 'Home', url: '/' },
              { name: match.Competitions?.name, url: `/competition/${match.Competitions?.id}` },
              { name: `${match.home_team?.name} vs ${match.away_team?.name}`, url: `/match/${match.id}` }
            ]}
          />
          <Suspense fallback={<div className="text-center py-8">Loading match details...</div>}>
            <MatchDetails match={match} />
          </Suspense>
        </div>
      </div>
    </>
  );
} 