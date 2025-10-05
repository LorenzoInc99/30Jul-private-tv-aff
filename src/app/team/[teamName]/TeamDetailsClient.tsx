"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { SITE_TITLE } from '../../../lib/constants';
import Breadcrumb from '@/components/Breadcrumb';
import MatchCard from '@/components/MatchCard';
import MatchDetails from '@/components/MatchDetails';
import MatchCardDisplay from '@/components/MatchCardDisplay';
import TeamLogo from '@/components/TeamLogo';
import TeamFormRectangles from '@/components/TeamFormRectangles';
import BroadcasterLogo from '@/components/BroadcasterLogo';
import { getMatchStatus } from '@/lib/database-config';
import { slugify } from '../../../lib/utils';
import { useTeam } from '../../../contexts/TeamContext';
import { MatchCardSkeleton, TeamDetailsSkeleton } from '@/components/LoadingSkeleton';
import StandingsTable from '@/components/StandingsTable';
import MobileTeamDetails from '@/components/MobileTeamDetails';


function transformMatchForCard(match: any) {
  if (!match) return null;
  
  return {
    id: match.id,
    name: match.name,
    start_time: match.starting_at,
    home_score: match.home_score,
    away_score: match.away_score,
    status: getMatchStatus(match.state_id),
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
    Event_Broadcasters: [],
    Odds: match.odds || []
  };
}

function NextMatchDetails({ match }: { match: any }) {
  if (!match) {
    return <div>No match data available</div>;
  }

  const getMatchStatus = () => {
    if (match.status === 'Live') return { text: 'LIVE', color: 'bg-red-500' };
    if (match.status === 'Finished') return { text: 'FULL TIME', color: 'bg-gray-500' };
    if (match.status === 'Scheduled') return { text: 'UPCOMING', color: 'bg-blue-500' };
    return { text: match.status, color: 'bg-gray-400' };
  };
  
  const status = getMatchStatus();
  const hasBroadcasters = match.Event_Broadcasters && match.Event_Broadcasters.length > 0;

  // Format date and time for the paragraph
  const matchDate = new Date(match.start_time);
  const formattedDate = matchDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = matchDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get the center content (time or result)
  const getCenterContent = () => {
    if (match.status === 'Finished' || match.status === 'Live') {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {match.home_score} - {match.away_score}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {match.status === 'Live' ? 'LIVE' : 'FULL TIME'}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {new Date(match.start_time).toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(match.start_time).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {/* Match Header */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-1 w-full">
        <div className={`px-6 py-3 ${status.color} text-white text-sm font-semibold uppercase tracking-wide`}>
          {status.text}
        </div>
        <div className="p-6">
          {/* Competition */}
          <div className="text-center mb-6">
            <Link 
              href={`/competition/${match.Competitions?.id}-${match.Competitions?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {match.Competitions?.name}
            </Link>
          </div>
          
          {/* Mobile: Compact layout for teams/score/time */}
          <div className="md:hidden flex flex-col items-center gap-4 mb-8 w-full">
            {/* Teams and center content row */}
            <div className="flex flex-row items-center justify-between w-full gap-4">
              {/* Team 1 */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <img 
                  src={match.home_team?.team_logo_url || 'https://placehold.co/40x40/f3f4f6/f3f4f6'} 
                  alt={match.home_team?.name || 'Home team logo'} 
                  className="w-10 h-10 object-contain mb-1" 
                />
                <Link
                  href={match.home_team?.id ? `/team/${slugify(match.home_team?.name || '')}/${match.home_team?.id}` : `/team/${slugify(match.home_team?.name || '')}`}
                  className={`text-xs truncate w-full text-center hover:underline ${
                    match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                      (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 
                        'font-black text-gray-900 dark:text-white' : 
                        'font-light text-gray-500 dark:text-gray-400') :
                    'font-bold text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {match.home_team?.name}
                </Link>
                <TeamFormRectangles
                  teamId={match.home_team?.id}
                  matchStartTime={match.start_time}
                />
              </div>
              
              {/* Center content (time or result) */}
              <div className="flex flex-col items-center justify-center w-16 mx-2">
                {getCenterContent()}
              </div>
              
              {/* Team 2 */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <img 
                  src={match.away_team?.team_logo_url || 'https://placehold.co/40x40/f3f4f6/f3f4f6'} 
                  alt={match.away_team?.name || 'Away team logo'} 
                  className="w-10 h-10 object-contain mb-1" 
                />
                <Link
                  href={match.away_team?.id ? `/team/${slugify(match.away_team?.name || '')}/${match.away_team?.id}` : `/team/${slugify(match.away_team?.name || '')}`}
                  className={`text-xs truncate w-full text-center hover:underline ${
                    match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                      (match.away_score !== null && match.away_score !== null && match.away_score > match.home_score ? 
                        'font-black text-gray-900 dark:text-white' : 
                        'font-light text-gray-500 dark:text-gray-400') :
                    'font-bold text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {match.away_team?.name}
                </Link>
                <TeamFormRectangles
                  teamId={match.away_team?.id}
                  matchStartTime={match.start_time}
                />
              </div>
            </div>
          </div>
          
          {/* Desktop: Teams, logos, and center content row */}
          <div className="hidden md:flex items-center justify-between mb-8 w-full">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <img
                src={match.home_team?.team_logo_url || 'https://placehold.co/60x60/f3f4f6/f3f4f6'}
                alt={match.home_team?.name || 'Home team logo'}
                className="w-14 h-14 object-contain mb-1"
              />
              <Link
                href={match.home_team?.id ? `/team/${slugify(match.home_team?.name || '')}/${match.home_team?.id}` : `/team/${slugify(match.home_team?.name || '')}`}
                className={`text-base truncate w-full text-center hover:underline ${
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 
                      'font-black text-gray-900 dark:text-white' : 
                      'font-light text-gray-500 dark:text-gray-400') :
                  'font-bold text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {match.home_team?.name}
              </Link>
              <TeamFormRectangles
                teamId={match.home_team?.id}
                matchStartTime={match.start_time}
              />
            </div>
            
            {/* Center content (time or result) */}
            <div className="flex flex-col items-center justify-center w-24 mx-6">
              {getCenterContent()}
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <img
                src={match.away_team?.team_logo_url || 'https://placehold.co/60x60/f3f4f6/f3f4f6'}
                alt={match.away_team?.name || 'Away team logo'}
                className="w-14 h-14 object-contain mb-1"
              />
              <Link
                href={match.away_team?.id ? `/team/${slugify(match.away_team?.name || '')}/${match.away_team?.id}` : `/team/${slugify(match.away_team?.name || '')}`}
                className={`text-base truncate w-full text-center hover:underline ${
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.away_score !== null && match.away_score !== null && match.away_score > match.home_score ? 
                      'font-black text-gray-900 dark:text-white' : 
                      'font-light text-gray-500 dark:text-gray-400') :
                  'font-bold text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {match.away_team?.name}
              </Link>
              <TeamFormRectangles
                teamId={match.away_team?.id}
                matchStartTime={match.start_time}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* TV Streamers Section */}
      {hasBroadcasters && (
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-2 w-full">
          <div className="p-2">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 3H3C2.45 3 2 3.45 2 4V20C2 20.55 2.45 21 3 21H21C21.55 21 22 20.55 22 20V4C22 3.45 21.55 3 21 3ZM20 19H4V5H20V19ZM10 10H8V12H10V10ZM16 10H14V12H16V10Z"/>
              </svg>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Watch on TV</h2>
            </div>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Where to watch {match.home_team?.name} vs {match.away_team?.name}:</strong> Catch all the action of this exciting {match.Competitions?.name} match between {match.home_team?.name} and {match.away_team?.name} live on TV on {formattedDate} at {formattedTime}. Don't miss a moment of this thrilling football encounter as both teams battle it out for victory.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-y-1 gap-x-2">
              {match.Event_Broadcasters.map((eb: any, i: number) => {
                const b = eb.Broadcasters;
                if (!b?.name) return null;
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <BroadcasterLogo
                      logoUrl={b.logo_url}
                      broadcasterName={b.name}
                      affiliateUrl={b.affiliate_url}
                      size="sm"
                      className="!w-6 !h-6"
                      showLabel={false}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamDetailsClient({ team, nextMatch, todayMatch, upcomingMatches, previousMatches, teamForm }: { 
  team: any; 
  nextMatch: any; 
  todayMatch: any;
  upcomingMatches: any[];
  previousMatches: any[]; 
  teamForm: any;
}) {
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Set loading to false when component mounts
  useEffect(() => {
    setIsLoading(false);
  }, []);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('Standing');
  const [matchesSubTab, setMatchesSubTab] = useState('Results');
  const matchesPerPage = 10; // Show 10 matches per page
  
  // Swipe functionality state
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Use team context
  const { setTeamData, setTeamMatches, setCurrentPage: setContextCurrentPage } = useTeam();

  // Transform matches for display - memoized to prevent infinite loops
  const transformedPreviousMatches = useMemo(() => 
    previousMatches.map(transformMatchForCard).filter(Boolean), 
    [previousMatches]
  );
  
  const transformedUpcomingMatches = useMemo(() => 
    (upcomingMatches || []).map(transformMatchForCard).filter(Boolean), 
    [upcomingMatches]
  );

  const transformedNextMatch = useMemo(() => 
    nextMatch ? transformMatchForCard(nextMatch) : null, 
    [nextMatch]
  );

  const transformedTodayMatch = useMemo(() => 
    todayMatch ? transformMatchForCard(todayMatch) : null, 
    [todayMatch]
  );

  // Combine all matches in chronological order (oldest to newest) for proper navigation
  const allMatches = useMemo(() => {
    // Combine all matches
    const allMatchesArray = [];
    if (transformedTodayMatch) {
      allMatchesArray.push(transformedTodayMatch);
    }
    allMatchesArray.push(...transformedUpcomingMatches, ...transformedPreviousMatches);
    
    // Sort all matches chronologically (oldest to newest)
    return allMatchesArray.sort((a, b) => {
      if (!a || !b) return 0;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  }, [transformedTodayMatch, transformedUpcomingMatches, transformedPreviousMatches]);

  // Create sliding window of matches around current position (-10 to +10)
  const slidingWindowMatches = useMemo(() => {
    if (allMatches.length === 0) return [];
    
    const windowSize = 21; // -10 previous + current + +10 next
    const startIndex = Math.max(0, currentMatchIndex - 10);
    const endIndex = Math.min(allMatches.length, startIndex + windowSize);
    
    return allMatches.slice(startIndex, endIndex);
  }, [allMatches, currentMatchIndex]);

  // Calculate the offset for the sliding window
  const windowOffset = useMemo(() => {
    return Math.max(0, currentMatchIndex - 10);
  }, [currentMatchIndex]);

  // Memoize the length to prevent unnecessary re-renders
  const allMatchesLength = useMemo(() => allMatches.length, [allMatches]);

  // Set team data in context when component mounts
  useEffect(() => {
    setTeamData(team);
    setTeamMatches(allMatches);
  }, [team, allMatches, setTeamData, setTeamMatches]);

  // Set initial match index to show the most relevant match
  useEffect(() => {
    if (allMatches.length > 0) {
      if (transformedTodayMatch) {
        // If there's a today match, show it (find its index in the sorted array)
        const todayIndex = allMatches.findIndex(match => 
          match && transformedTodayMatch && match.id === transformedTodayMatch.id
        );
        if (todayIndex !== -1) {
          setCurrentMatchIndex(todayIndex);
        }
      } else if (transformedNextMatch) {
        // If no today match, show the next upcoming match
        const nextIndex = allMatches.findIndex(match => 
          match && transformedNextMatch && match.id === transformedNextMatch.id
        );
        if (nextIndex !== -1) {
          setCurrentMatchIndex(nextIndex);
        }
      }
    }
  }, [allMatches, transformedTodayMatch, transformedNextMatch]);

  // Set current page in context separately to avoid dependency issues
  useEffect(() => {
    setContextCurrentPage(currentPage);
  }, [currentPage]);


  // Navigation functions - Next shows newer match, Previous shows older match
  const goToNextMatch = () => {
    if (currentMatchIndex < allMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    }
  };

  const goToPreviousMatch = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1);
    }
  };

  // Get current match from sliding window
  const currentMatch = useMemo(() => {
    const windowIndex = currentMatchIndex - windowOffset;
    return slidingWindowMatches[windowIndex] || transformedTodayMatch || transformedNextMatch;
  }, [slidingWindowMatches, currentMatchIndex, windowOffset, transformedTodayMatch, transformedNextMatch]);

  // Touch event handlers for swipe detection
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

    if (isLeftSwipe) {
      goToNextMatch(); // Swipe left = next match (newer)
    }
    if (isRightSwipe) {
      goToPreviousMatch(); // Swipe right = previous match (older)
    }
  };

  // Navigation functions
  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxPage = Math.max(
      Math.ceil((transformedPreviousMatches.length - 1) / matchesPerPage),
      Math.ceil((upcomingMatches?.length || 0) / matchesPerPage)
    );
    setCurrentPage(prev => Math.min(maxPage, prev + 1));
  };

  // Get current page matches
  const getCurrentPageMatches = (matches: any[]) => {
    const startIndex = currentPage * matchesPerPage;
    return matches.slice(startIndex, startIndex + matchesPerPage);
  };
  
  // Get country from next match or previous matches
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
  const searchParams = useSearchParams();
  const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [starredMatches, setStarredMatches] = useState<string[]>([]);

  // Load starred matches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('starredMatches');
    if (saved) {
      try {
        setStarredMatches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing starred matches:', error);
        setStarredMatches([]);
      }
    }
  }, []);

  // Save starred matches to localStorage
  const handleStarToggle = (matchId: string) => {
    setStarredMatches((prev: string[]) => {
      const newStarred = prev.includes(matchId) 
        ? prev.filter((id: string) => id !== matchId)
        : [...prev, matchId];
      
      localStorage.setItem('starredMatches', JSON.stringify(newStarred));
      return newStarred;
    });
  };

  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }


  // Get league ID from next match or upcoming matches
  const getLeagueId = () => {
    if (nextMatch?.league?.id) {
      return nextMatch.league.id;
    }
    if (upcomingMatches && upcomingMatches.length > 0 && upcomingMatches[0]?.league?.id) {
      return upcomingMatches[0].league.id;
    }
    if (previousMatches && previousMatches.length > 0 && previousMatches[0]?.league?.id) {
      return previousMatches[0].league.id;
    }
    return null;
  };

  // Tab content components
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Standing':
        const leagueId = getLeagueId();
        if (!leagueId) {
          return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No league information available for this team.</p>
            </div>
          );
        }
        return <StandingsTable leagueId={leagueId} />;
      case 'Matches':
        // Get matches based on sub-tab
        const getMatchesForSubTab = () => {
          if (matchesSubTab === 'Results') {
            // Last 10 matches, most recent first
            return transformedPreviousMatches.slice(0, 10);
          } else {
            // Next 10 matches, next first
            return transformedUpcomingMatches.slice(0, 10);
          }
        };

        const matchesToShow = getMatchesForSubTab();
        
        // Group matches by league in chronological order
        const groupMatchesByLeague = (matches: any[]) => {
          const leagueGroups: { [key: string]: any[] } = {};
          
          matches.forEach(match => {
            const leagueName = match.Competitions?.name || match.league?.name || 'Unknown League';
            if (!leagueGroups[leagueName]) {
              leagueGroups[leagueName] = [];
            }
            leagueGroups[leagueName].push(match);
          });
          
          // Convert to array and sort by most recent match in each league
          return Object.entries(leagueGroups)
            .map(([leagueName, leagueMatches]) => ({
              leagueName,
              matches: leagueMatches
            }))
            .sort((a, b) => {
              // Sort by the most recent match in each league
              const aMostRecent = new Date(a.matches[0].start_time);
              const bMostRecent = new Date(b.matches[0].start_time);
              return bMostRecent.getTime() - aMostRecent.getTime();
            });
        };

        const groupedMatches = groupMatchesByLeague(matchesToShow);

        return (
          <div className="space-y-4">
            {/* Sub-tabs for Results/Fixtures */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
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
            {matchesToShow.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No {matchesSubTab.toLowerCase()} available for this team.
              </div>
            ) : (
              <div className="space-y-4">
                {groupedMatches.map((leagueGroup, groupIdx) => (
                  <div key={leagueGroup.leagueName} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-3 md:rounded-lg md:shadow">
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700">
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
                              showOdds={matchesSubTab === 'Fixtures'}
                              showTv={matchesSubTab === 'Fixtures'}
                              isStarred={isStarred}
                              onStarToggle={handleStarToggle}
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
            )}
          </div>
        );
      case 'Statistics':
        return (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Team statistics will be displayed here.</p>
          </div>
        );
      case 'Players':
        return (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Player roster will be displayed here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <TeamDetailsSkeleton />;
  }

  // Mobile version - only show on mobile screens
  return (
    <>
      {/* Mobile Layout - Hidden on desktop */}
      <div className="md:hidden">
        <MobileTeamDetails
          team={team}
          nextMatch={nextMatch}
          todayMatch={todayMatch}
          upcomingMatches={upcomingMatches}
          previousMatches={previousMatches}
          teamForm={teamForm}
          timezone={timezone}
          starredMatches={starredMatches}
          onStarToggle={handleStarToggle}
        />
      </div>

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:block flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <div className="mb-4 mt-4">
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
      </div>
      
      <div className="container mx-auto max-w-7xl px-1 md:px-2">
        <main className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
          
          {/* Team Header Section */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-start gap-4 mb-2">
              <TeamLogo
                logoUrl={team.team_logo_url}
                teamName={team.name}
                size="xl"
                className="flex-shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {team.name}
                  </h1>
                </div>
                {teamCountry && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {teamCountry}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Get the latest {team.name} fixtures and {team.name} matches schedule. Find where to watch {team.name} matches live on TV and discover where to watch {team.name} tonight. Get the best odds for {team.name} games from top bookmakers. Never miss a {team.name} fixture with our comprehensive match coverage.
            </p>
          </div>

          {/* Match Section with Swipe Functionality */}
          <div className="mb-8">
            {currentMatch ? (
              <div 
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Navigation Indicators */}
                <div className="flex justify-between items-center mb-4 px-6">
                  <button
                    onClick={goToPreviousMatch}
                    disabled={currentMatchIndex === 0}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentMatchIndex === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  
                  <button
                    onClick={goToNextMatch}
                    disabled={currentMatchIndex === allMatches.length - 1}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentMatchIndex === allMatches.length - 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                    }`}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Match Display */}
                <MatchCardDisplay 
                  match={currentMatch} 
                  timezone={timezone}
                />
                
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No matches available for {team.name}.
              </div>
            )}
          </div>

          {/* Tabbed Menu Section */}
          <div className="px-6 pb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {['Standing', 'Matches', 'Statistics', 'Players'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out ${
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
            
            {/* Tab Content with Smooth Transition */}
            <div className="mt-6">
              <div 
                key={activeTab}
                className="animate-in fade-in-0 slide-in-from-top-2 duration-300"
              >
                {renderTabContent()}
              </div>
            </div>
          </div>

        </main>
      </div>
      </div>
    </>
  );
} 