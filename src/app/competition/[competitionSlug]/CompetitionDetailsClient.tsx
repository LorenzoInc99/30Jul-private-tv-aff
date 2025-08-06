"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SITE_TITLE } from '../../../lib/constants';
import Head from 'next/head';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useState } from 'react';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { slugify } from '../../../lib/utils';

function CompetitionStructuredData({ competition, matches }: { competition: any; matches: any[] }) {
  if (!competition || !matches.length) return null;
  
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
          name: competition.name
        }
      }
    };
  }).filter(Boolean);

  const schema = {
    '@context': 'http://schema.org',
    '@type': 'SportsLeague',
    name: competition.name,
    sport: 'Football',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: itemListElements,
      numberOfItems: itemListElements.length
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function CompetitionDetailsClient({ competition, matches }: { competition: any; matches: any[] }) {
  const searchParams = useSearchParams();
  const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  // Helper to get the correct timezone string
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  // Add competition property to each match for consistent MatchCard rendering
  const matchesWithCompetition = matches.map(m => ({ ...m, competition }));
  
  // Separate matches into results (past/current) and fixtures (future)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const results = matchesWithCompetition.filter(match => new Date(match.start_time) <= today);
  const fixtures = matchesWithCompetition.filter(match => new Date(match.start_time) > today);
  
  // Sort results: most recent first (descending)
  const sortedResults = results.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  // Sort fixtures: next match first (ascending)
  const sortedFixtures = fixtures.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  // Group by date function
  const groupMatchesByDate = (matches: any[]) => {
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
    return matchesByDate;
  };
  
  const resultsByDate = groupMatchesByDate(sortedResults);
  const fixturesByDate = groupMatchesByDate(sortedFixtures);

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://your-domain.com/competition/${competition.id}-${competition.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} />
        <meta property="og:title" content={`${competition.name} - Live Matches & Fixtures | Live Football TV Guide`} />
        <meta property="og:description" content={`Get the complete ${competition.name} schedule, live matches, broadcasters, and betting odds. Never miss a ${competition.name} game!`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://your-domain.com/competition/${competition.id}-${competition.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${competition.name} - Live Matches & Fixtures | Live Football TV Guide`} />
        <meta name="twitter:description" content={`Get the complete ${competition.name} schedule, live matches, broadcasters, and betting odds. Never miss a ${competition.name} game!`} />
        <meta name="twitter:image" content="/og-image.jpg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'http://schema.org',
          '@type': 'SportsOrganization',
          'name': competition.name,
          'sport': 'Football',
          'url': `https://your-domain.com/competition/${competition.id}-${competition.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
        }) }} />
      </Head>
      <div className="flex flex-col min-h-screen bg-gray-50 w-full">
        <div className="w-full bg-gray-50 dark:bg-gray-900">
          <Breadcrumbs
            items={[
              { name: 'Home', url: '/' },
              { name: competition.name, url: `/competition/${competition.id}` }
            ]}
          />
        </div>
        <CompetitionStructuredData competition={competition} matches={matches} />
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <main className="p-0 w-full bg-gray-50 dark:bg-gray-900">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {competition.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete schedule, live matches, and betting odds
                </p>
              </div>
              
              {matches.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No matches found for this competition.
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900">
                  <div className="w-full md:max-w-3xl mx-auto">
                    <Tabs defaultValue="fixtures" className="w-full">
                      <TabsList className="flex w-full border-b border-gray-200 dark:border-gray-700 mb-6 bg-transparent">
                        <TabsTrigger value="fixtures" className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent rounded-none">Fixtures</TabsTrigger>
                        <TabsTrigger value="results" className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent rounded-none">Results</TabsTrigger>
                        <TabsTrigger value="standings" className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent rounded-none">Standings</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="results" className="space-y-8">
                        {Object.keys(resultsByDate).length === 0 ? (
                          <div className="text-center text-gray-500 py-10">
                            No results available yet.
                          </div>
                        ) : (
                          Object.entries(resultsByDate).map(([date, dateMatches]) => (
                            <div key={date} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-3 mx-auto">
                              <div className="flex items-center py-2 bg-gray-100 dark:bg-gray-700 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700 px-4 md:px-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  {date}
                                </h2>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {(dateMatches as any[]).map((match: any) => {
                                  const homeSlug = slugify(match.home_team?.name || 'home');
                                  const awaySlug = slugify(match.away_team?.name || 'away');
                                  const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                                  return (
                                    <MatchCard
                                      key={match.id}
                                      match={match}
                                      timezone={timezone}
                                      isExpanded={expandedMatch === match.id}
                                      onExpandToggle={e => {
                                        e.stopPropagation();
                                        setExpandedMatch(expandedMatch === match.id ? null : match.id);
                                      }}
                                      onClick={e => {
                                        window.open(matchUrl, '_blank');
                                      }}
                                      hideCompetitionName={true}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="fixtures" className="space-y-8">
                        {Object.keys(fixturesByDate).length === 0 ? (
                          <div className="text-center text-gray-500 py-10">
                            No upcoming fixtures available.
                          </div>
                        ) : (
                          Object.entries(fixturesByDate).map(([date, dateMatches]) => (
                            <div key={date} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-3 mx-auto">
                              <div className="flex items-center py-2 bg-gray-100 dark:bg-gray-700 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700 px-4 md:px-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  {date}
                                </h2>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {(dateMatches as any[]).map((match: any) => {
                                  const homeSlug = slugify(match.home_team?.name || 'home');
                                  const awaySlug = slugify(match.away_team?.name || 'away');
                                  const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                                  return (
                                    <MatchCard
                                      key={match.id}
                                      match={match}
                                      timezone={timezone}
                                      isExpanded={expandedMatch === match.id}
                                      onExpandToggle={e => {
                                        e.stopPropagation();
                                        setExpandedMatch(expandedMatch === match.id ? null : match.id);
                                      }}
                                      onClick={e => {
                                        window.open(matchUrl, '_blank');
                                      }}
                                      hideCompetitionName={true}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="standings" className="space-y-8">
                        <StandingsTable leagueId={competition.id} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
} 