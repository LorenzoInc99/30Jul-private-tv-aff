"use client";
// Updated date heading styles - force rebuild
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SITE_TITLE } from '../../../lib/constants';
import Head from 'next/head';
import Breadcrumb from '@/components/Breadcrumb';
import { useState, useEffect } from 'react';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { slugify } from '../../../lib/utils';
import LeagueLogo from '@/components/LeagueLogo';
import { getStarredLeagues, toggleStarredLeague, isLeagueStarred as checkLeagueStarred } from '../../../lib/starred-leagues';
import AccumulatorBuilder from '@/components/AccumulatorBuilder';

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
  const [starredMatches, setStarredMatches] = useState<string[]>([]);
  const [isLeagueStarred, setIsLeagueStarred] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAccumulatorBuilder, setShowAccumulatorBuilder] = useState(false);

  // Load starred matches and league state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('starredMatches');
    if (saved) {
      try {
        setStarredMatches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing starred matches:', error);
        setStarredMatches([]);
      }
    }
    
    // Check if this league is starred
    setIsLeagueStarred(checkLeagueStarred(competition.id));
  }, [competition.id]);

  // Save starred matches to localStorage
  const handleStarToggle = (matchId: string) => {
    setStarredMatches(prev => {
      const newStarred = prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId];
      
      localStorage.setItem('starredMatches', JSON.stringify(newStarred));
      return newStarred;
    });
  };

  // Handle league star toggle
  const handleLeagueStarToggle = () => {
    toggleStarredLeague(competition);
    setIsLeagueStarred(!isLeagueStarred);
  };

  // Helper to get the correct timezone string
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  // Transform matches to use the same data structure as the home page
  const matchesWithCompetition = matches.map(m => {
    // Ensure the match has the same structure as getMatchesForDate
    return {
      ...m,
      competition,
      // Ensure these fields exist and are properly structured
      Event_Broadcasters: m.Event_Broadcasters || [],
      Odds: m.Odds || [],
      Competitions: {
        id: competition.id,
        name: competition.name,
        country: competition.country
      }
    };
  });
  
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
          <div className="px-6 py-3 mt-4 mb-4">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/' },
                { 
                  label: competition.name, 
                  isActive: true 
                }
              ]} 
            />
          </div>
        </div>
        <CompetitionStructuredData competition={competition} matches={matches} />
        <div className="container mx-auto max-w-7xl" style={{ outline: 'none', border: 'none' }}>
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300" style={{ outline: 'none', border: 'none' }}>
            <main className="p-0 w-full bg-gray-50 dark:bg-gray-900">
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <LeagueLogo
                    logoUrl={competition.league_logo}
                    leagueName={competition.name}
                    leagueId={competition.id}
                    size="xl"
                    className="flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {competition.name}
                      </h1>
                      {mounted && (
                        <button
                          onClick={handleLeagueStarToggle}
                          className={`p-2 rounded-full transition-colors ${
                            isLeagueStarred
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          title={isLeagueStarred ? 'Unstar league' : 'Star league'}
                          aria-label={isLeagueStarred ? 'Unstar league' : 'Star league'}
                        >
                          <svg 
                            className="w-6 h-6" 
                            fill={isLeagueStarred ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442c.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          </button>
                        )}
                    </div>
                    {competition.country && (
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {competition.country.name}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Get the latest {competition.name} fixtures and {competition.name} matches schedule. Find where to watch {competition.name} matches live on TV and discover where to watch {competition.name} tonight. Get the best odds for {competition.name} games from top bookmakers. Never miss a {competition.name} fixture with our comprehensive match coverage.
                </p>
                
              </div>
              
              {matches.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No matches found for this competition.
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900" style={{ outline: 'none', border: 'none' }}>
                  <div className="w-full" style={{ outline: 'none', border: 'none' }}>
                    <Tabs defaultValue="standings" className="w-full" style={{ outline: 'none', border: 'none' }}>
                      <TabsList className="flex w-full border-b border-gray-200 dark:border-gray-700 mb-6 bg-transparent">
                        <TabsTrigger value="standings" className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent rounded-none">Standings</TabsTrigger>
                        <TabsTrigger value="fixtures" className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent rounded-none">Fixtures</TabsTrigger>
                        <TabsTrigger value="results" className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent rounded-none">Results</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="standings" className="space-y-8" style={{ outline: 'none', border: 'none' }}>
                        <StandingsTable leagueId={competition.id} />
                      </TabsContent>
                      
                      <TabsContent value="fixtures" className="space-y-8" style={{ outline: 'none', border: 'none' }}>
                        {Object.keys(fixturesByDate).length === 0 ? (
                          <div className="text-center text-gray-500 py-10">
                            No upcoming fixtures available.
                          </div>
                        ) : (
                          Object.entries(fixturesByDate).map(([date, dateMatches]) => (
                            <div key={date} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-3 mx-auto focus:outline-none" style={{ outline: 'none' }}>
                              <div className="flex items-center py-2 bg-gray-100 dark:bg-gray-700 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700 px-4 md:px-6">
                                <h2 className="text-sm font-medium text-white dark:text-white">
                                  {date}
                                </h2>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-700" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔥 Match clicked, navigating to:', matchUrl);
                                        console.log('🔥 Match details:', { id: match.id, home: match.home_team?.name, away: match.away_team?.name });
                                        window.open(matchUrl, '_blank');
                                      }}
                                      hideCompetitionName={true}
                                      showOdds={true}
                                      showTv={true}
                                      isStarred={starredMatches.includes(match.id)}
                                      onStarToggle={handleStarToggle}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="results" className="space-y-8" style={{ outline: 'none', border: 'none' }}>
                        {Object.keys(resultsByDate).length === 0 ? (
                          <div className="text-center text-gray-500 py-10">
                            No results available yet.
                          </div>
                        ) : (
                          Object.entries(resultsByDate).map(([date, dateMatches]) => (
                            <div key={date} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-3 mx-auto focus:outline-none" style={{ outline: 'none' }}>
                              <div className="flex items-center py-2 bg-gray-100 dark:bg-gray-700 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700 px-4 md:px-6">
                                <h2 className="text-sm font-medium text-white dark:text-white">
                                  {date}
                                </h2>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-gray-700" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔥 Match clicked, navigating to:', matchUrl);
                                        console.log('🔥 Match details:', { id: match.id, home: match.home_team?.name, away: match.away_team?.name });
                                        window.open(matchUrl, '_blank');
                                      }}
                                      hideCompetitionName={true}
                                      showOdds={true}
                                      showTv={true}
                                      isStarred={starredMatches.includes(match.id)}
                                      onStarToggle={handleStarToggle}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
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