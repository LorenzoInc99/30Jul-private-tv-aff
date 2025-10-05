import React from 'react';
import Link from 'next/link';
import TeamLogo from './TeamLogo';
import TeamFormRectangles from './TeamFormRectangles';
import MatchOddsDisplay from './MatchOddsDisplay';

interface MatchCardDisplayProps {
  match: any;
  timezone?: string;
  useShortDateFormat?: boolean;
}

export default function MatchCardDisplay({ match, timezone = 'auto', useShortDateFormat = false }: MatchCardDisplayProps) {
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
    
    if (useShortDateFormat) {
      // For Results: use dd/mm format
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } else {
      // For Fixtures: use existing format
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
  }

  // Format date for finished matches (e.g., "18 Oct")
  function formatFinishedMatchDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  }

  return (
    <div className="rounded-lg overflow-hidden">
      
      {/* Mobile: Simplified layout - Home | Time | Away */}
      <div className="md:hidden flex items-center justify-between w-full px-4 py-4">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <Link 
            href={match.home_team_id ? `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.home_team_id}` : `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
            className="group cursor-pointer transition-transform hover:scale-105"
          >
            <TeamLogo 
              logoUrl={match.home_team?.team_logo_url} 
              teamName={homeTeamName} 
              size="lg" 
            />
          </Link>
          <Link 
            href={match.home_team_id ? `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.home_team_id}` : `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
            className="group cursor-pointer mt-2"
          >
            <span className="text-sm font-bold text-center text-white group-hover:text-blue-400 transition-colors">
              {homeTeamName}
            </span>
          </Link>
          <div className="mt-1">
            <TeamFormRectangles
              teamId={match.home_team_id}
              matchStartTime={match.start_time}
            />
          </div>
        </div>
        
        {/* Center - Time and Date */}
        <div className="flex flex-col items-center justify-center mx-4">
          <span className="text-lg font-bold text-white">
            {match.status === 'Live' ? 
              `${match.home_score || 0} - ${match.away_score || 0}` :
              (match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' || (match.home_score !== null && match.away_score !== null)) ?
              `${match.home_score || 0} - ${match.away_score || 0}` :
              formatTimeConsistently(match.start_time, timezone)
            }
          </span>
          <span className="text-xs text-gray-300 mt-1">
            {match.status === 'Live' ? 
              `${match.live_minute || 'LIVE'}'` :
              (match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' || (match.home_score !== null && match.away_score !== null)) ?
              formatFinishedMatchDate(match.start_time) :
              formatShortDate(match.start_time)
            }
          </span>
        </div>
        
        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <Link 
            href={match.away_team_id ? `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.away_team_id}` : `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
            className="group cursor-pointer transition-transform hover:scale-105"
          >
            <TeamLogo 
              logoUrl={match.away_team?.team_logo_url} 
              teamName={awayTeamName} 
              size="lg" 
            />
          </Link>
          <Link 
            href={match.away_team_id ? `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.away_team_id}` : `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
            className="group cursor-pointer mt-2"
          >
            <span className="text-sm font-bold text-center text-white group-hover:text-blue-400 transition-colors">
              {awayTeamName}
            </span>
          </Link>
          <div className="mt-1">
            <TeamFormRectangles
              teamId={match.away_team_id}
              matchStartTime={match.start_time}
            />
          </div>
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:grid grid-cols-3 items-center justify-center w-full max-w-7xl gap-6 md:gap-16 px-6 py-2">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px]">
          {/* Logo Row */}
          <div className="flex items-center justify-center h-12 md:h-16 mb-1">
            <Link 
              href={match.home_team_id ? `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.home_team_id}` : `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
              className="group cursor-pointer transition-transform hover:scale-105"
            >
              <TeamLogo 
                logoUrl={match.home_team?.team_logo_url} 
                teamName={homeTeamName} 
                size="lg" 
              />
            </Link>
          </div>
          {/* Team Name Row */}
          <div className="flex items-center justify-center h-6 md:h-8 px-1 md:px-2 w-full max-w-[120px] md:max-w-[140px]">
            <Link 
              href={match.home_team_id ? `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.home_team_id}` : `/team/${encodeURIComponent(homeTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
              className="group cursor-pointer"
            >
              <span className="text-sm md:text-base font-bold text-center truncate leading-tight text-white group-hover:text-blue-400 transition-colors">
                {homeTeamName}
              </span>
            </Link>
          </div>
          {/* Form Row */}
          <div className="flex items-center justify-center h-4">
            <TeamFormRectangles
              teamId={match.home_team_id}
              matchStartTime={match.start_time}
            />
          </div>
        </div>
        
        {/* Center content - Standardized layout for all match states */}
        <div className="flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px] px-6 md:px-12">
          <div className="flex flex-col items-center justify-center">
            {/* Main content - Time/Score based on match status */}
            <span className="text-xl md:text-3xl font-extrabold text-white">
              {match.status === 'Live' ? 
                `${match.home_score || 0} - ${match.away_score || 0}` :
                (match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' || (match.home_score !== null && match.away_score !== null)) ?
                `${match.home_score || 0} - ${match.away_score || 0}` :
                formatTimeConsistently(match.start_time, timezone)
              }
            </span>
            
            {/* Secondary content - Date/Live minute based on match status */}
            <span className="text-xs md:text-sm text-white mt-0">
              {match.status === 'Live' ? 
                `${match.live_minute || 'LIVE'}'` :
                (match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' || (match.home_score !== null && match.away_score !== null)) ?
                formatFinishedMatchDate(match.start_time) :
                formatShortDate(match.start_time)
              }
            </span>
            
            {/* League Name and Venue Information - Always show */}
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
            
            {/* Odds Display - Show for all match states */}
            <div className="mt-1">
              <MatchOddsDisplay odds={match.Odds || []} matchStatus={match.status} />
            </div>
          </div>
        </div>
        
        {/* Away Team */}
        <div className="flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px]">
          {/* Logo Row */}
          <div className="flex items-center justify-center h-12 md:h-16 mb-1">
            <Link 
              href={match.away_team_id ? `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.away_team_id}` : `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
              className="group cursor-pointer transition-transform hover:scale-105"
            >
              <TeamLogo 
                logoUrl={match.away_team?.team_logo_url} 
                teamName={awayTeamName} 
                size="lg" 
              />
            </Link>
          </div>
          {/* Team Name Row */}
          <div className="flex items-center justify-center h-6 md:h-8 px-1 md:px-2 w-full max-w-[120px] md:max-w-[140px]">
            <Link 
              href={match.away_team_id ? `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}/${match.away_team_id}` : `/team/${encodeURIComponent(awayTeamName.toLowerCase().replace(/\s+/g, '-'))}`}
              className="group cursor-pointer"
            >
              <span className="text-sm md:text-base font-bold text-center truncate leading-tight text-white group-hover:text-blue-400 transition-colors">
                {awayTeamName}
              </span>
            </Link>
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
