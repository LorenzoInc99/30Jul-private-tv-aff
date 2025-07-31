"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SITE_TITLE } from '../../../lib/constants';
import Head from 'next/head';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import MatchCard from '@/components/MatchCard'; // Added import for MatchCard
import TeamLogo from '@/components/TeamLogo';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function TeamStructuredData({ team, matches }: { team: any; matches: any[] }) {
  if (!team || !matches.length) return null;

  const itemListElements = matches.map((match, idx) => {
    if (!match.home_team || !match.away_team) return null;
    return {
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'SportsEvent',
        name: `${match.home_team.name} vs ${match.away_team.name}`,
        url: `/match/${match.id}-${slugify(match.home_team.name)}-vs-${slugify(match.away_team.name)}`,
        startDate: new Date(match.start_time).toISOString(),
        sport: 'Football',
        performer: [
          { '@type': 'SportsTeam', name: match.home_team.name },
          { '@type': 'SportsTeam', name: match.away_team.name }
        ],
        superEvent: {
          '@type': 'SportsLeague',
          name: match.competition?.name || 'Football League'
        }
      }
    };
  }).filter(Boolean);

  const schema = {
    '@context': 'http://schema.org',
    '@type': 'SportsTeam',
    name: team.name,
    sport: 'Football',
    logo: team.team_logo_url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: itemListElements,
      numberOfItems: itemListElements.length
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function TeamDetailsClient({ team, matches }: { team: any; matches: any[] }) {
  const searchParams = useSearchParams();
  const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  const matchesByDate: Record<string, any[]> = {};
  matches.forEach(match => {
    const date = new Date(match.start_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!matchesByDate[date]) {
      matchesByDate[date] = [];
    }
    matchesByDate[date].push(match);
  });

  const totalMatches = matches.length;
  const homeMatches = matches.filter(m => m.home_team_id === team.id).length;
  const awayMatches = matches.filter(m => m.away_team_id === team.id).length;

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://your-domain.com/team/${team.id}-${slugify(team.name || '')}`} />
        <meta property="og:title" content={`${team.name} - Team Profile, Matches & Stats | Live Football TV Guide`} />
        <meta property="og:description" content={`Get ${team.name} team profile, recent matches, upcoming fixtures, players, stats, and live betting odds. Follow ${team.name} performance and results!`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://your-domain.com/team/${team.id}-${slugify(team.name || '')}`} />
        <meta property="og:image" content={team.team_logo_url || '/og-image.jpg'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${team.name} - Team Profile, Matches & Stats | Live Football TV Guide`} />
        <meta name="twitter:description" content={`Get ${team.name} team profile, recent matches, upcoming fixtures, players, stats, and live betting odds. Follow ${team.name} performance and results!`} />
        <meta name="twitter:image" content={team.team_logo_url || '/og-image.jpg'} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'http://schema.org',
          '@type': 'SportsTeam',
          name: team.name,
          sport: 'Football',
          url: `https://your-domain.com/team/${team.id}-${slugify(team.name || '')}`,
          logo: team.logo_url
        }) }} />
      </Head>
      {/* Removed the inner <header> block. Only the global header remains. */}
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { name: 'Home', url: '/' },
              { name: 'Teams', url: '/teams' },
              { name: team.name, url: `/team/${team.id}` }
            ]}
          />
        </div>
        <TeamStructuredData team={team} matches={matches} />
        <div className="container mx-auto max-w-7xl px-1 md:px-2">
          <main className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
            {/* Team Profile Section */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="mb-2">
                  <TeamLogo 
                    logoUrl={team.team_logo_url} 
                    teamName={team.name} 
                    size="lg" 
                    className="w-24 h-24"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-0 text-center">
                  {team.name}
                </h1>
              </div>
            </div>

            {/* Matches Section */}
            <div>
              {matches.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No matches found for this team.
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Matches ({totalMatches})
                    </h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Home: {homeMatches} | Away: {awayMatches}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(matchesByDate).map(([date, dateMatches]) => (
                      <div key={date} className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs font-medium">
                            {date}
                          </span>
                          {dateMatches[0]?.competition?.name && (
                            <Link
                              href={`/competition/${dateMatches[0].competition.id}-${slugify(dateMatches[0].competition.name)}`}
                              className="ml-2 text-gray-500 underline hover:text-indigo-600 transition-colors text-sm"
                            >
                              {dateMatches[0].competition.name}
                            </Link>
                          )}
                        </h3>
                        <div className="space-y-2">
                          {dateMatches.map((match, idx) => {
                            const homeSlug = slugify(match.home_team?.name || 'home');
                            const awaySlug = slugify(match.away_team?.name || 'away');
                            const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                            // Add competition property for consistency
                            const matchWithCompetition = { ...match, competition: match.competition };
                            return (
                              <div key={match.id} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                {/* Mobile: Custom layout (unchanged) */}
                                <div className="md:hidden">
                                  {/* ...existing mobile code remains... */}
                                </div>
                                {/* Desktop: Use MatchCard */}
                                <div className="hidden md:block">
                                  <MatchCard
                                    match={matchWithCompetition}
                                    timezone={timezone}
                                    isExpanded={false}
                                    onExpandToggle={() => {}}
                                    onClick={() => window.open(matchUrl, '_blank')}
                                    hideCompetitionName={true} // <-- change this to true
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
