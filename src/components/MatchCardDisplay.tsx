import React from 'react';
import Link from 'next/link';
import TeamLogo from './TeamLogo';
import TeamFormRectangles from './TeamFormRectangles';
import MatchOddsDisplay from './MatchOddsDisplay';

interface MatchCardDisplayProps {
  match: any;
  timezone?: string;
}

export default function MatchCardDisplay({ match, timezone = 'auto' }: MatchCardDisplayProps) {
  if (!match) return null;

  const homeTeamName = match.home_team?.name || 'Home Team';
  const awayTeamName = match.away_team?.name || 'Away Team';

  // Format time consistently
  function formatTimeConsistently(dateString: string, targetTimezone: string): string {
    const date = new Date(dateString);
    
    if (targetTimezone === 'auto') {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: targetTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return formatter.format(date);
      } catch (error) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
  }

  // Format short date
  function formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  return (
    <div className="rounded-lg overflow-hidden">
      
      {/* Teams and Score Row - Grid layout for perfect alignment */}
      <div className="grid grid-cols-3 items-center justify-center w-full max-w-7xl gap-6 md:gap-16 px-6 py-2">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px]">
          {/* Logo Row */}
          <div className="flex items-center justify-center h-16 md:h-20 mb-1">
            <TeamLogo 
              logoUrl={match.home_team?.team_logo_url} 
              teamName={homeTeamName} 
              size="xl" 
            />
          </div>
          {/* Team Name Row */}
          <div className="flex items-center justify-center h-6 md:h-8 px-1 md:px-2 w-full max-w-[120px] md:max-w-[140px]">
            <span className="text-sm md:text-base font-bold text-center truncate leading-tight text-white">
              {homeTeamName}
            </span>
          </div>
          {/* Form Row */}
          <div className="flex items-center justify-center h-4">
            <TeamFormRectangles
              teamId={match.home_team_id}
              matchStartTime={match.start_time}
            />
          </div>
        </div>
        
        {/* Center content */}
        <div className="flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px] px-6 md:px-12">
          {(match.status === 'Full Time' || match.status === 'Live' || 
            match.status === 'After Extra Time' || match.status === 'After Penalties' ||
            (match.home_score !== null && match.away_score !== null)) ? (
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl md:text-3xl font-extrabold text-white">
                {match.home_score || 0} - {match.away_score || 0}
              </span>
              <span className="text-xs md:text-sm text-gray-400 mt-1">
                {(match.status === 'Live') ? 'LIVE' : 'FULL TIME'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl md:text-3xl font-extrabold text-white">
                {formatTimeConsistently(match.start_time, timezone)}
              </span>
              <span className="text-xs md:text-sm text-white mt-0">
                {formatShortDate(match.start_time)}
              </span>
              {/* League Name and Venue Information */}
              <div className="flex items-center justify-center mt-1 mb-1 gap-3 whitespace-nowrap">
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <span className="text-sm font-medium">
                    {match.Competitions?.name || match.league?.name}
                  </span>
                </div>
                <span className="text-white text-sm">|</span>
                <div className="flex items-center gap-2 text-xs text-white">
                  <span>Venue Information</span>
                </div>
              </div>
              {/* Odds Display */}
              <div className="mt-1">
                <MatchOddsDisplay odds={match.Odds || []} matchStatus={match.status} />
              </div>
            </div>
          )}
        </div>
        
        {/* Away Team */}
        <div className="flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px]">
          {/* Logo Row */}
          <div className="flex items-center justify-center h-16 md:h-20 mb-1">
            <TeamLogo 
              logoUrl={match.away_team?.team_logo_url} 
              teamName={awayTeamName} 
              size="xl" 
            />
          </div>
          {/* Team Name Row */}
          <div className="flex items-center justify-center h-6 md:h-8 px-1 md:px-2 w-full max-w-[120px] md:max-w-[140px]">
            <span className="text-sm md:text-base font-bold text-center truncate leading-tight text-white">
              {awayTeamName}
            </span>
          </div>
          {/* Form Row */}
          <div className="flex items-center justify-center h-4">
            <TeamFormRectangles
              teamId={match.away_team_id}
              matchStartTime={match.start_time}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
