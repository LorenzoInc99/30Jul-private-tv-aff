"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SITE_TITLE } from '../../../lib/constants';
import Breadcrumbs from '@/components/Breadcrumbs';
import MatchCard from '@/components/MatchCard';
import MatchDetails from '@/components/MatchDetails';
import TeamLogo from '@/components/TeamLogo';
import TeamFormRectangles from '@/components/TeamFormRectangles';
import BroadcasterLogo from '@/components/BroadcasterLogo';
import { getMatchStatus } from '@/lib/database-config';
import { slugify } from '../../../lib/utils';
import { useTeam } from '../../../contexts/TeamContext';

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
                  href={`/team/${slugify(match.home_team?.name || '')}`}
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
                  href={`/team/${slugify(match.away_team?.name || '')}`}
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
                href={`/team/${slugify(match.home_team?.name || '')}`}
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
                href={`/team/${slugify(match.away_team?.name || '')}`}
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

export default function TeamDetailsClient({ team, nextMatch, upcomingMatches, previousMatches, teamForm }: { 
  team: any; 
  nextMatch: any; 
  upcomingMatches: any[];
  previousMatches: any[]; 
  teamForm: any;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const matchesPerPage = 5; // Show 5 matches per page (2 upcoming + 3 previous, then 5 previous)
  
  // Use team context
  const { setTeamData, setTeamMatches, setCurrentPage: setContextCurrentPage } = useTeam();

  // Transform matches for display
  const transformedPreviousMatches = previousMatches.map(transformMatchForCard).filter(Boolean);
  const transformedUpcomingMatches = (upcomingMatches || []).map(transformMatchForCard).filter(Boolean);

  // Combine all matches in chronological order (2 upcoming + 8 previous)
  // Upcoming matches first (ascending), then previous matches (descending)
  const allMatches = [
    ...transformedUpcomingMatches,
    ...transformedPreviousMatches
  ];

  // Set team data in context when component mounts
  useEffect(() => {
    setTeamData(team);
    setTeamMatches(allMatches);
    setContextCurrentPage(currentPage);
  }, [team, allMatches, currentPage]);

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

  const transformedNextMatch = transformMatchForCard(nextMatch);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: team.name, url: `/team/${slugify(team.name)}` }
          ]}
        />
      </div>
      
      <div className="container mx-auto max-w-7xl px-1 md:px-2">
        <main className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
          
          {/* Team Header Section */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
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
            <p className="text-gray-600 dark:text-gray-400">
              Get the latest {team.name} fixtures and {team.name} matches schedule. Find where to watch {team.name} matches live on TV and discover where to watch {team.name} tonight. Get the best odds for {team.name} games from top bookmakers. Never miss a {team.name} fixture with our comprehensive match coverage.
            </p>
          </div>

          {/* Next Match Section */}
          <div className="mb-8">
            {transformedNextMatch ? (
              <NextMatchDetails match={transformedNextMatch} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No upcoming matches scheduled for {team.name}.
              </div>
            )}
          </div>

          {/* Team Form Section */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Team Form</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{teamForm.wins}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{teamForm.draws}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{teamForm.losses}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Last 5 matches</div>
                <div className="flex justify-center space-x-2">
                  {teamForm.formResults.map((result: string, index: number) => (
                    <span
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        result === 'W' ? 'bg-green-100 text-green-800' :
                        result === 'D' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Goals: {teamForm.goalsFor} for, {teamForm.goalsAgainst} against
              </div>
            </div>
          </div>

          {/* Matches Section - Simple List */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent & Upcoming Matches</h2>
              
              {/* Simple Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage + 1}
                </span>
                <button 
                  onClick={handleNext}
                  disabled={currentPage >= Math.ceil((allMatches.length - 1) / matchesPerPage)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage >= Math.ceil((allMatches.length - 1) / matchesPerPage)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* All Matches in Chronological Order */}
              <div className="space-y-2">
                {getCurrentPageMatches(allMatches).map((match) => {
                  if (!match) return null;
                  return (
                    <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <MatchCard
                        match={match}
                        timezone={timezone}
                        isExpanded={false}
                        onExpandToggle={() => {}}
                        onClick={() => {
                          const homeSlug = slugify(match.home_team?.name || 'home');
                          const awaySlug = slugify(match.away_team?.name || 'away');
                          const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                          window.open(matchUrl, '_blank');
                        }}
                        hideCompetitionName={false}
                        showOdds={true}
                        showTv={true}
                        isStarred={starredMatches.includes(match.id)}
                        onStarToggle={handleStarToggle}
                      />
                    </div>
                  );
                })}
                {getCurrentPageMatches(allMatches).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No matches found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* League Standing Placeholder */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">League Standing</h2>
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">League standings coming soon</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">We're working on adding detailed league tables</p>
              </div>
            </div>
          </div>

          {/* Stadium Info Placeholder */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stadium Information</h2>
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Stadium information coming soon</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">We're working on adding stadium details and capacity information</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
} 