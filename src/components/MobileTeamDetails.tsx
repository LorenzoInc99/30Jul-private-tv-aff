'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { slugify } from '../lib/utils';
import MobileMatchCard from './MobileMatchCard';
import MatchCard from './MatchCard';
import MobileTeamHeaderCard from './MobileTeamHeaderCard';
import TeamLogo from './TeamLogo';
import TeamFormRectangles from './TeamFormRectangles';
import Breadcrumb from './Breadcrumb';

interface MobileTeamDetailsProps {
  team: any;
  nextMatch: any;
  todayMatch: any;
  upcomingMatches: any[];
  previousMatches: any[];
  teamForm: any;
  timezone: string;
  starredMatches: string[];
  onStarToggle: (matchId: string) => void;
}

export default function MobileTeamDetails({
  team,
  nextMatch,
  todayMatch,
  upcomingMatches,
  previousMatches,
  teamForm,
  timezone,
  starredMatches,
  onStarToggle
}: MobileTeamDetailsProps) {
  const [activeTab, setActiveTab] = useState('Standing');
  const [matchesSubTab, setMatchesSubTab] = useState('Results');
  const [visibleMatchesCount, setVisibleMatchesCount] = useState(5);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Function to load more matches
  const loadMoreMatches = () => {
    setVisibleMatchesCount(prev => prev + 5);
  };

  // Transform matches for display
  const transformMatchForCard = (match: any) => {
    if (!match) return null;
    
    return {
      id: match.id,
      name: match.name,
      start_time: match.starting_at,
      home_score: match.home_score,
      away_score: match.away_score,
      status: match.status,
      Competitions: {
        id: match.league?.id,
        name: match.league?.name,
        country: null,
        logo_url: match.league?.league_logo,
        league_logo_url: match.league?.league_logo
      },
      home_team: {
        id: match.home_team?.id,
        name: match.home_team?.name,
        team_logo_url: match.home_team?.team_logo_url
      },
      away_team: {
        id: match.away_team?.id,
        name: match.away_team?.name,
        team_logo_url: match.away_team?.team_logo_url
      },
      Event_Broadcasters: match.Event_Broadcasters || [],
      Odds: match.odds || []
    };
  };

  const transformedNextMatch = nextMatch ? transformMatchForCard(nextMatch) : null;
  const transformedTodayMatch = todayMatch ? transformMatchForCard(todayMatch) : null;
  const transformedUpcomingMatches = (upcomingMatches || []).map(transformMatchForCard).filter(Boolean);
  const transformedPreviousMatches = previousMatches.map(transformMatchForCard).filter(Boolean);

  // Combine all matches in chronological order
  const allMatches = [
    ...(transformedTodayMatch ? [transformedTodayMatch] : []),
    ...transformedUpcomingMatches,
    ...transformedPreviousMatches
  ].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Set initial match index
  useEffect(() => {
    if (allMatches.length > 0) {
      if (transformedTodayMatch) {
        const todayIndex = allMatches.findIndex(match => 
          match && transformedTodayMatch && match.id === transformedTodayMatch.id
        );
        if (todayIndex !== -1) {
          setCurrentMatchIndex(todayIndex);
        }
      } else if (transformedNextMatch) {
        const nextIndex = allMatches.findIndex(match => 
          match && transformedNextMatch && match.id === transformedNextMatch.id
        );
        if (nextIndex !== -1) {
          setCurrentMatchIndex(nextIndex);
        }
      }
    }
  }, [allMatches, transformedTodayMatch, transformedNextMatch]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentMatchIndex < allMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    }
    if (isRightSwipe && currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1);
    }
  };

  const currentMatch = allMatches[currentMatchIndex];

  // Get team country
  const getTeamCountry = () => {
    if (nextMatch?.league?.country?.name) {
      return nextMatch.league.country.name;
    }
    if (previousMatches.length > 0 && previousMatches[0]?.league?.country?.name) {
      return previousMatches[0].league.country.name;
    }
    return null;
  };

  const teamCountry = getTeamCountry();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:hidden">
      {/* Breadcrumb */}
      <div className="px-4 pt-4 pb-2">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { 
              label: team.name, 
              isActive: true 
            }
          ]} 
        />
      </div>

      {/* Mobile Team Header Card */}
      <MobileTeamHeaderCard 
        team={team} 
        teamCountry={teamCountry} 
      />

      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="px-4">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {['Standing', 'Matches', 'Statistics', 'Players'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'Standing' && (
          <div className="p-4">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>Standings will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'Matches' && (
          <div className="p-4">
            {/* Sub-tabs for Results/Fixtures */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
              <button
                onClick={() => setMatchesSubTab('Results')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  matchesSubTab === 'Results'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Results ({transformedPreviousMatches.length})
              </button>
              <button
                onClick={() => setMatchesSubTab('Fixtures')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  matchesSubTab === 'Fixtures'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Fixtures ({transformedUpcomingMatches.length})
              </button>
            </div>

            {/* Matches display grouped by league */}
            {(() => {
              const getMatchesForSubTab = () => {
                if (matchesSubTab === 'Results') {
                  return transformedPreviousMatches.slice(0, visibleMatchesCount);
                } else {
                  return transformedUpcomingMatches.slice(0, visibleMatchesCount);
                }
              };

              const matchesToShow = getMatchesForSubTab();
              
              // Group matches by league
              const groupMatchesByLeague = (matches: any[]) => {
                const leagueGroups: { [key: string]: any[] } = {};
                
                matches.forEach(match => {
                  const leagueName = match.Competitions?.name || match.league?.name || 'Unknown League';
                  if (!leagueGroups[leagueName]) {
                    leagueGroups[leagueName] = [];
                  }
                  leagueGroups[leagueName].push(match);
                });
                
                return Object.entries(leagueGroups)
                  .map(([leagueName, leagueMatches]) => ({
                    leagueName,
                    matches: leagueMatches
                  }))
                  .sort((a, b) => {
                    const aMostRecent = new Date(a.matches[0].start_time);
                    const bMostRecent = new Date(b.matches[0].start_time);
                    return bMostRecent.getTime() - aMostRecent.getTime();
                  });
              };

              const groupedMatches = groupMatchesByLeague(matchesToShow);

              if (matchesToShow.length === 0) {
                return (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No {matchesSubTab.toLowerCase()} available for this team.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {groupedMatches.map((leagueGroup, groupIdx) => (
                    <div key={leagueGroup.leagueName} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-base font-semibold border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col">
                            <Link 
                              href={`/competition/${leagueGroup.matches[0]?.Competitions?.id || leagueGroup.matches[0]?.league?.id}-${leagueGroup.leagueName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                              className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors duration-200"
                            >
                              {leagueGroup.leagueName}
                              <span className="text-sm font-normal ml-1">({leagueGroup.matches.length})</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="collapse-transition expanded" style={{ opacity: 1 }}>
                        {leagueGroup.matches.map((match, idx) => {
                          const homeSlug = match.home_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'home';
                          const awaySlug = match.away_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'away';
                          const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}`;
                          const isStarred = starredMatches.includes(match.id);
                          
                          return (
                            <div key={match.id} className={`overflow-x-auto w-full ${idx === 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                              <MatchCard
                                match={match}
                                timezone={timezone}
                                isExpanded={false}
                                showOdds={false}
                                showTv={false}
                                isStarred={isStarred}
                                onStarToggle={onStarToggle}
                                onExpandToggle={() => {}}
                                onClick={() => {
                                  window.open(matchUrl, '_blank');
                                }}
                                useShortDateFormat={matchesSubTab === 'Results'}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Load More Button */}
            {(() => {
              const totalMatches = matchesSubTab === 'Results' 
                ? transformedPreviousMatches.length 
                : transformedUpcomingMatches.length;
              
              if (visibleMatchesCount < totalMatches) {
                return (
                  <div className="px-4 pb-4">
                    <button
                      onClick={loadMoreMatches}
                      className="w-full py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show More
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {activeTab === 'Statistics' && (
          <div className="p-4">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>Team statistics will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'Players' && (
          <div className="p-4">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>Player roster will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
