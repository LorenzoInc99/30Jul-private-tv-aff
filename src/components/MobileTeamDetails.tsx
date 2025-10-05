'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { slugify } from '../lib/utils';
import MobileMatchCard from './MobileMatchCard';
import TeamLogo from './TeamLogo';
import TeamFormRectangles from './TeamFormRectangles';

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
  const [activeTab, setActiveTab] = useState('matches');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40">
        <div className="flex items-center p-4">
          <Link href="/" className="mr-3">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <TeamLogo
            logoUrl={team.team_logo_url}
            teamName={team.name}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="ml-3 flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {team.name}
            </h1>
            {teamCountry && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {teamCountry}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="flex">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'matches'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'standings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Standings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'matches' && (
          <div>
            {/* Current Match Swiper */}
            {currentMatch && (
              <div 
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Navigation Indicators */}
                <div className="flex justify-between items-center p-4">
                  <button
                    onClick={() => setCurrentMatchIndex(Math.max(0, currentMatchIndex - 1))}
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
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentMatchIndex + 1} of {allMatches.length}
                  </span>
                  
                  <button
                    onClick={() => setCurrentMatchIndex(Math.min(allMatches.length - 1, currentMatchIndex + 1))}
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
                <MobileMatchCard 
                  match={currentMatch} 
                  timezone={timezone}
                  showOdds={true}
                  showTv={true}
                  isStarred={starredMatches.includes(currentMatch.id)}
                  onStarToggle={onStarToggle}
                />
              </div>
            )}

            {/* All Matches List */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Matches</h3>
              <div className="space-y-3">
                {allMatches.map((match, index) => (
                  <MobileMatchCard
                    key={match.id}
                    match={match}
                    timezone={timezone}
                    showOdds={false}
                    showTv={true}
                    isStarred={starredMatches.includes(match.id)}
                    onStarToggle={onStarToggle}
                    onTap={() => setCurrentMatchIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="p-4">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>Standings will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
