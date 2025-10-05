import React from 'react';
import { useRouter } from 'next/navigation';
import { getBestOddsFromTransformed } from '../lib/database-adapter';
import TeamLogo from './TeamLogo';
import BroadcasterLogo from './BroadcasterLogo';
import LeagueLogo from './LeagueLogo';
import { slugify } from '../lib/utils';
import { Calendar } from 'lucide-react';

export default function MatchCard({ match, timezone, isExpanded, onExpandToggle, onClick, hideCompetitionName = false, showOdds = true, showTv = true, selectedCountry = null, isStarred = false, onStarToggle, useShortDateFormat = false, homePageFormat = false }: {
  match: any;
  timezone: string;
  isExpanded: boolean;
  onExpandToggle: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  hideCompetitionName?: boolean;
  showOdds?: boolean;
  showTv?: boolean;
  selectedCountry?: { id: number; name: string; image_path?: string } | null;
  isStarred?: boolean;
  onStarToggle?: (matchId: string) => void;
  useShortDateFormat?: boolean;
  homePageFormat?: boolean;
}) {
  const router = useRouter();
  
  const handleLeagueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (match.Competitions?.id && match.Competitions?.name) {
      const leagueSlug = slugify(match.Competitions.name);
      const leagueUrl = `/competition/${match.Competitions.id}-${leagueSlug}`;
      console.log('🏆 Navigating to league:', leagueUrl);
      router.push(leagueUrl);
    }
  };
  
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  // Format date for finished matches
  function formatMatchDate(dateString: string): string {
    const date = new Date(dateString);
    
    if (useShortDateFormat) {
      // For Results: use dd/mm format
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } else {
      // For Fixtures: use existing format (e.g., "20-Jul")
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    return `${day}-${month}`;
    }
  }

  // Custom time formatter to avoid hydration mismatches
  function formatTimeConsistently(dateString: string, targetTimezone: string): string {
    const date = new Date(dateString);
    
    // For home page format, always show time (since date is already shown in the group header)
    if (homePageFormat) {
      if (targetTimezone === 'auto') {
        // Use local time for auto timezone
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else {
        // For specific timezone, use proper timezone conversion
        try {
          const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: targetTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          return formatter.format(date);
        } catch (error) {
          // Fallback to local time if timezone is invalid
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      }
    }
    
    // For other pages, use the existing logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchDate = new Date(dateString);
    matchDate.setHours(0, 0, 0, 0);
    
    // If match is not today, show date format (dd-mm)
    if (matchDate.getTime() !== today.getTime()) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}-${month}`;
    }
    
    // If match is today, show time
    if (targetTimezone === 'auto') {
      // Use local time for auto timezone
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // For specific timezone, use proper timezone conversion
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: targetTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return formatter.format(date);
      } catch (error) {
        // Fallback to local time if timezone is invalid
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
  }

  // Format time for display below date when match is not today
  function formatTimeForFutureMatches(dateString: string, targetTimezone: string): string {
    const date = new Date(dateString);
    
    // For home page format, always show time (since date is already shown in the group header)
    if (homePageFormat) {
      if (targetTimezone === 'auto') {
        // Use local time for auto timezone
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else {
        // For specific timezone, use proper timezone conversion
        try {
          const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: targetTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          return formatter.format(date);
        } catch (error) {
          // Fallback to local time if timezone is invalid
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      }
    }
    
    // For other pages, use the existing logic
    if (targetTimezone === 'auto') {
      // Use local time for auto timezone
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // For specific timezone, use proper timezone conversion
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: targetTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return formatter.format(date);
      } catch (error) {
        // Fallback to local time if timezone is invalid
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
  }
  
  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStarToggle) {
      onStarToggle(match.id);
    }
  };

  // Check if match is live - including both "Live" status and actual live match statuses
  const isLive = match.status === 'Live' || 
                 match.status === '1st Half' || 
                 match.status === '2nd Half' || 
                 match.status === 'Half Time' ||
                 match.status === 'ET - 2nd Half' ||
                 match.status === 'Extra Time' ||
                 match.status === 'Penalties';

  const handleTeamClick = (e: React.MouseEvent, teamName: string, teamId: number) => {
    console.log('Team clicked:', teamName, 'ID:', teamId);
    const teamSlug = slugify(teamName);
    console.log('Generated slug:', teamSlug);
    const teamUrl = `/team/${teamSlug}/${teamId}`;
    console.log('Opening URL:', teamUrl);
    window.open(teamUrl, '_blank');
  };

  console.log('🎯 MatchCard rendering for match:', match.id, 'onClick provided:', !!onClick);
  
  return (
    <div 
      className="w-full md:w-full h-full overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 focus:outline-none cursor-pointer" 
      style={{ outline: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      onClick={(e) => {
        console.log('🔥 OUTER DIV CLICKED:', match.id);
        // Call onClick directly from outer div
        if (onClick) {
          console.log('🎯 Calling onClick from outer div');
          e.preventDefault();
          e.stopPropagation();
          onClick(e);
        }
      }}
    >
      <div
        className={`group w-full h-full cursor-pointer relative p-2 md:py-0 md:px-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none ${isLive ? 'border-l-0' : ''}`}
        tabIndex={0}
        aria-label={`View details for ${match.home_team?.name} vs ${match.away_team?.name}`}
        role="button"
        onClick={(e) => {
          console.log('🎯 MATCH CARD CLICKED:', match.id, 'Target:', e.target);
          console.log('🎯 ALWAYS CALLING ONCLICK - TESTING');
          
          // Always call onClick for now to test
          e.preventDefault();
          e.stopPropagation();
          if (onClick) {
            console.log('🎯 Calling onClick handler');
            onClick(e);
          } else {
            console.log('🎯 No onClick handler provided');
          }
        }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); }}
        style={{ pointerEvents: 'auto', outline: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Live Match Indicator */}
        {isLive && (
          <div className="absolute left-0 top-1 bottom-1 w-2 bg-orange-500 rounded-r-xl animate-pulse"></div>
        )}
        
        {/* Mobile: Enhanced compact layout */}
        <div className={`flex items-center gap-2 md:hidden w-full h-full ${
          isLive ? 'border-l-4 border-l-red-500' : ''
        }`}>
          {/* Grid layout for perfect alignment */}
          <div className="grid grid-cols-[60px_1fr_80px] gap-2 w-full items-center pl-3">
            {/* Date/Time Column */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-xs font-bold text-gray-900 dark:text-white text-center pt-1">
                {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties'
                  ? formatMatchDate(match.start_time)
                  : formatTimeConsistently(match.start_time, getTargetTimezone())}
              </span>
              <div className="flex items-center justify-center mt-0.5 pb-1">
                {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ? (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">FT</span>
                ) : isLive ? (
                  <span className="text-xs font-medium text-red-500 animate-pulse">
                    {match.elapsed || 'LIVE'}
                  </span>
                ) : (() => {
                  // For home page format, always show calendar icon (since time is already shown above)
                  if (homePageFormat) {
                    return (
                      <button
                        data-calendar-click="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to calendar functionality
                          const startTime = new Date(match.start_time);
                          const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
                          const title = `${match.home_team?.name || 'Home'} vs ${match.away_team?.name || 'Away'}`;
                          const description = `${match.competition?.name || 'Football Match'}`;
                          
                          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}`;
                          window.open(calendarUrl, '_blank');
                        }}
                        className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:scale-110 transition-all duration-200 cursor-pointer rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        title="Add to calendar"
                      >
                        <Calendar size={16} />
                      </button>
                    );
                  }
                  
                  // For other pages, use the existing logic
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const matchDate = new Date(match.start_time);
                  matchDate.setHours(0, 0, 0, 0);
                  
                  // If match is not today, show time below date
                  if (matchDate.getTime() !== today.getTime()) {
                    return (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {formatTimeForFutureMatches(match.start_time, getTargetTimezone())}
                      </span>
                    );
                  }
                  
                  // If match is today, show calendar icon
                  return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to calendar functionality
                      const startTime = new Date(match.start_time);
                      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
                      const title = `${match.home_team?.name || 'Home'} vs ${match.away_team?.name || 'Away'}`;
                      const description = `${match.competition?.name || 'Football Match'}`;
                      
                      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}`;
                      window.open(calendarUrl, '_blank');
                    }}
                      className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:scale-110 transition-all duration-200 cursor-pointer rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    title="Add to calendar"
                  >
                    <Calendar size={16} />
                  </button>
                  );
                })()}
              </div>
            </div>

            {/* Teams Column */}
            <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex-shrink-0">
                <TeamLogo 
                  logoUrl={match.home_team?.team_logo_url} 
                  teamName={match.home_team?.name || 'Unknown'} 
                  size="sm" 
                />
              </div>
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.home_team?.name, match.home_team?.id);
                }}
                className={`text-sm truncate inline-block text-left transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-900 dark:text-white font-normal' :
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'font-black text-gray-900 dark:text-white' : 'font-light text-gray-500 dark:text-gray-400') :
                  'font-normal text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.home_team?.name}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex-shrink-0">
                <TeamLogo 
                  logoUrl={match.away_team?.team_logo_url} 
                  teamName={match.away_team?.name || 'Unknown'} 
                  size="sm" 
                />
              </div>
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.away_team?.name, match.away_team?.id);
                }}
                className={`text-sm truncate inline-block text-left transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-900 dark:text-white font-normal' :
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.away_score > match.home_score ? 'font-black text-gray-900 dark:text-white' : 'font-light text-gray-500 dark:text-gray-400') :
                  'font-normal text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.away_team?.name}
              </button>
            </div>
          </div>
          </div>

          {/* Middle Content Group - Centered Odds/TV */}
          <div className="flex items-center justify-center gap-4 flex-1">
            {/* Dynamic Right Column - Odds or TV Channels */}
            <div className="flex-shrink-0 w-20">
            {showOdds ? (
              // Odds Mode
              <div className="flex gap-1">
                {(() => {
                  const bestOdds = getBestOddsFromTransformed(match.Odds || []);
                  const oddsTypes = [
                    { key: 'home', label: '1', data: bestOdds.home },
                    { key: 'draw', label: 'X', data: bestOdds.draw },
                    { key: 'away', label: '2', data: bestOdds.away }
                  ];
                  
                  return oddsTypes.map(({ key, label, data }) => {
                    const isWinningOdds = match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                      (key === 'home' && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score) ||
                      (key === 'away' && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score) : false;
                    
                    return data.value !== null ? (
                      <div
                        key={key}
                        className={`flex-1 text-center py-1 px-0.5 rounded text-xs font-bold ${
                          isWinningOdds ? 
                          'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {parseFloat(data.value as any).toFixed(2)}
                      </div>
                    ) : (
                      <div key={key} className="flex-1 text-center py-1 text-xs text-gray-400">-</div>
                    );
                  });
                })()}
              </div>
            ) : (
              // TV Channels Mode
              <div className="flex items-center gap-1">
                {(() => {
                  const broadcasters = match.Event_Broadcasters ? match.Event_Broadcasters.filter((eb: any) => eb.Broadcasters && eb.Broadcasters.name) : [];
                  const visible = broadcasters.slice(0, 3);
                  const hasMore = broadcasters.length > 3;
                  
                  return (
                    <>
                      {visible.map((eb: any, idx: number) => {
                        const b = eb.Broadcasters;
                        return (
                          <div key={idx} className="w-5 h-5 flex-shrink-0">
                            <BroadcasterLogo
                              logoUrl={b.logo_url}
                              broadcasterName={b.name}
                              affiliateUrl={b.affiliate_url}
                              size="sm"
                              className="!w-5 !h-5"
                              showLabel={false}
                            />
                          </div>
                        );
                      })}
                      {hasMore && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{broadcasters.length - 3}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          </div>

          {/* Right Content Group - Fixed width for Score */}
          <div className="flex justify-end w-16">
            {/* Score Column - Far right position */}
            <div className="flex-shrink-0 w-10 text-center flex flex-col gap-0.5">
            {match.home_score !== null && match.home_score !== undefined && match.away_score !== null && match.away_score !== undefined ? (
              <>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {match.home_score}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {match.away_score}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-400">-</span>
                <span className="text-sm text-gray-400">-</span>
              </>
            )}
          </div>
          </div>

            {/* Score Column */}
            <div className="flex flex-col items-center justify-center">
              {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ? (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {match.home_score || 0} - {match.away_score || 0}
                </span>
              ) : (
                <span className="text-sm text-gray-400">-</span>
            )}
          </div>
        </div>
        </div>
        {/* Desktop: Row layout - Three column layout */}
        <div className="hidden md:flex w-full h-full relative items-center pl-3">
          {/* Left Content Group - Fixed width */}
          <div className="flex items-center w-80">
            {/* Time */}
            <div className="text-xs font-bold w-10 mr-5 flex flex-col items-center justify-center py-1"> {/* Time column: 40px width, 16px margin */}
              <span className="text-xs text-center pt-1">
                {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties'
                  ? formatMatchDate(match.start_time)
                  : formatTimeConsistently(match.start_time, getTargetTimezone())}
              </span>
              <div className="flex items-center justify-center mt-0.5 pb-1">
                {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ? (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">FT</span>
                ) : isLive ? (
                  <span className="text-xs font-medium text-red-500 animate-pulse">
                    {match.elapsed || 'LIVE'}
                  </span>
                ) : (() => {
                  // For home page format, always show calendar icon (since time is already shown above)
                  if (homePageFormat) {
                    return (
                      <button
                        data-calendar-click="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to calendar functionality
                          const startTime = new Date(match.start_time);
                          const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
                          const title = `${match.home_team?.name || 'Home'} vs ${match.away_team?.name || 'Away'}`;
                          const description = `${match.competition?.name || 'Football Match'}`;
                          
                          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}`;
                          window.open(calendarUrl, '_blank');
                        }}
                        className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:scale-110 transition-all duration-200 cursor-pointer rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        title="Add to calendar"
                      >
                        <Calendar size={16} />
                      </button>
                    );
                  }
                  
                  // For other pages, use the existing logic
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const matchDate = new Date(match.start_time);
                  matchDate.setHours(0, 0, 0, 0);
                  
                  // If match is not today, show time below date
                  if (matchDate.getTime() !== today.getTime()) {
                    return (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {formatTimeForFutureMatches(match.start_time, getTargetTimezone())}
                      </span>
                    );
                  }
                  
                  // If match is today, show calendar icon
                  return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to calendar functionality
                      const startTime = new Date(match.start_time);
                      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
                      const title = `${match.home_team?.name || 'Home'} vs ${match.away_team?.name || 'Away'}`;
                      const description = `${match.competition?.name || 'Football Match'}`;
                      
                      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}`;
                      window.open(calendarUrl, '_blank');
                    }}
                      className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:scale-110 transition-all duration-200 cursor-pointer rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    title="Add to calendar"
                  >
                    <Calendar size={16} />
                  </button>
                  );
                })()}
              </div>
            </div>
            {/* Teams with logos */}
            <div className="flex flex-col min-w-0 flex-1 max-w-[300px]"> {/* Teams column: takes remaining space in left group */}
            {/* Competition name with league logo */}
            {!hideCompetitionName && match.competition?.name && (
              <div className="flex items-center gap-2 mb-1">
                {match.Competitions?.league_logo && (
                  <LeagueLogo 
                    logoUrl={match.Competitions.league_logo} 
                    leagueName={match.competition.name} 
                    leagueId={match.Competitions.id}
                    size="sm" 
                    className="flex-shrink-0"
                  />
                )}
                <button 
                  onClick={handleLeagueClick}
                  className="text-base font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors duration-200 cursor-pointer"
                  title={`View ${match.competition.name} league page`}
                >
                  {match.competition.name}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <TeamLogo 
                logoUrl={match.home_team?.team_logo_url} 
                teamName={match.home_team?.name || 'Unknown'} 
                size="sm" 
              />
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.home_team?.name, match.home_team?.id);
                }}
                className={`text-sm truncate inline-block text-left transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-300 font-normal' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'font-black text-gray-900 dark:text-white' : 'font-light text-gray-500 dark:text-gray-400') :
                  'font-normal text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.home_team?.name}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <TeamLogo 
                logoUrl={match.away_team?.team_logo_url} 
                teamName={match.away_team?.name || 'Unknown'} 
                size="sm" 
              />
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.away_team?.name, match.away_team?.id);
                }}
                className={`text-sm truncate inline-block text-left transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-300 font-normal' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.away_score !== null && match.away_score !== null && match.away_score > match.home_score ? 'font-black text-gray-900 dark:text-white' : 'font-light text-gray-500 dark:text-gray-400') :
                  'font-normal text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.away_team?.name}
              </button>
            </div>
          </div>
          </div>
          
          {/* Middle Content Group - Centered Odds and TV */}
          <div className="flex items-center justify-center gap-8 flex-1">
            {/* Odds */}
            <div className={`flex flex-row items-center gap-1 justify-center w-35 ${!showOdds ? 'invisible' : ''}`}> {/* Odds column: 144px width */}
            {match.status !== 'Finished' && match.status !== 'Full Time' && match.status !== 'After Extra Time' && match.status !== 'After Penalties' ? (
              (() => {
                const bestOdds = getBestOddsFromTransformed(match.Odds || []);
                const oddsTypes = [
                  { key: 'home', label: '1', data: bestOdds.home },
                  { key: 'draw', label: 'X', data: bestOdds.draw },
                  { key: 'away', label: '2', data: bestOdds.away }
                ];
                
                // Always render 3 boxes for alignment
                return oddsTypes.map(({ key, label, data }) => {
                  return data.value !== null ? (
                    <a
                      key={key}
                      href={data.operator?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 hover:scale-105 hover:drop-shadow-sm transition-all duration-100 ease-in-out min-w-[58px] min-h-[36px]"
                      data-odds-click="true"
                      onClick={e => e.stopPropagation()}
                      tabIndex={0}
                      aria-label={`Best odds for ${label} by ${data.operator?.name || 'Unknown'}`}
                    >
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{parseFloat(data.value as any).toFixed(2)}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight text-ellipsis overflow-hidden whitespace-nowrap w-full">{data.operator?.name || 'Unknown'}</span>
                    </a>
                  ) : (
                    <div key={key} className="flex flex-col items-center justify-center text-center w-full px-0.5 py-0.5 min-w-[58px] min-h-[36px]" aria-label="No odds available">
                      <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
                    </div>
                  );
                });
              })()
            ) : (
              // Hide odds completely for finished matches - render empty space for alignment
              <div className="flex-1"></div>
            )}
          </div>
          {/* TV Stream Logos */}
          <div className={`flex flex-row-reverse items-center gap-1 justify-end min-w-0 w-35 mr-4 ${!showTv ? 'invisible' : ''}`}> {/* TV column: 128px width, 16px margin */}
            {(() => {
              let broadcasters = match.Event_Broadcasters ? match.Event_Broadcasters.filter((eb: any) => eb.Broadcasters && eb.Broadcasters.name) : [];
              
              // Filter by selected country if one is selected
              if (selectedCountry) {
                broadcasters = broadcasters.filter((eb: any) => 
                  eb.Broadcasters && eb.Broadcasters.country_id === selectedCountry.id
                );
              }
              
              const count = broadcasters.length;
              const maxToShow = 3; // Reduced to 3 visible channels to accommodate bigger logos
              const visible = broadcasters.slice(0, maxToShow);
              const hasMore = count > maxToShow;
              
              return (
                <>
                  {/* "See more" indicator */}
                  {hasMore && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{count - maxToShow}
                    </span>
                  )}
                  
                  {/* Visible channels */}
                  {visible.map((eb: any, idx: number) => {
                    const b = eb.Broadcasters;
                    return (
                      <div
                        key={b.name + idx}
                        className="flex-shrink-0 hover:scale-105 hover:drop-shadow-sm transition-all duration-100 ease-in-out"
                        data-tv-click="true"
                        onClick={e => { e.stopPropagation(); }}
                      >
                        <BroadcasterLogo
                          logoUrl={b.logo_url}
                          broadcasterName={b.name}
                          affiliateUrl={b.affiliate_url}
                          size="sm"
                          className="!w-8 !h-8"
                          showLabel={false}
                        />
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
          </div>
          
          {/* Right Content Group - Fixed width for Score */}
          <div className="flex justify-end w-20">
            {/* Score - Far right position */}
            <div className="flex flex-col items-center justify-center font-semibold text-sm text-gray-800 dark:text-gray-200 min-w-0 w-12"> {/* Score column: 48px width, far right */}
            {match.home_score !== null && match.home_score !== undefined && match.away_score !== null && match.away_score !== undefined ? (
              <>
                <span className={`text-base ${
                  isLive ? 'text-white font-bold' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score > match.away_score ? 'font-extrabold text-gray-900 dark:text-gray-100' : 'font-normal text-gray-600 dark:text-gray-400') :
                  'font-bold text-gray-800 dark:text-gray-200'
                }`}>
                  {match.home_score}
                </span>
                <span className={`text-base ${
                  isLive ? 'text-white font-bold' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.away_score > match.home_score ? 'font-extrabold text-gray-900 dark:text-gray-100' : 'font-normal text-gray-600 dark:text-gray-400') :
                  'font-bold text-gray-800 dark:text-gray-200'
                }`}>
                  {match.away_score}
                </span>
              </>
            ) : (
              <>
                <span>-</span>
                <span>-</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 