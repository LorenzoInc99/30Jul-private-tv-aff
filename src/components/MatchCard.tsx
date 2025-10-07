import React from 'react';
import { useRouter } from 'next/navigation';
import { getBestOddsFromTransformed } from '../lib/database-adapter';
import TeamLogo from './TeamLogo';
import OptimizedTeamLogo from './OptimizedTeamLogo';
import BroadcasterLogo from './BroadcasterLogo';
import LeagueLogo from './LeagueLogo';
import { slugify } from '../lib/utils';
import { Calendar } from 'lucide-react';
import { MatchCardSkeleton } from './LoadingSkeleton';

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
      // Use UTC for server-side rendering to avoid hydration mismatches
      // Client-side will handle auto timezone detection
      return 'UTC';
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
      // Always use UTC for server-side rendering to avoid hydration mismatches
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: targetTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return formatter.format(date);
      } catch (error) {
        // Fallback to UTC time if timezone is invalid
        const utcHours = date.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${utcHours}:${utcMinutes}`;
      }
    }
    
    // For other pages, use the existing logic
    // Use UTC for consistent server/client rendering
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const matchDate = new Date(dateString);
    const matchDateUTC = new Date(Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate()));
    
    // If match is not today, show date format (dd-mm)
    if (matchDateUTC.getTime() !== todayUTC.getTime()) {
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      return `${day}-${month}`;
    }
    
    // If match is today, show time
    try {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: targetTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return formatter.format(date);
    } catch (error) {
      // Fallback to UTC time if timezone is invalid
      const utcHours = date.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${utcHours}:${utcMinutes}`;
    }
  }

  // Format time for display below date when match is not today
  function formatTimeForFutureMatches(dateString: string, targetTimezone: string): string {
    const date = new Date(dateString);
    
    // For home page format, always show time (since date is already shown in the group header)
    if (homePageFormat) {
      // Always use consistent timezone formatting to avoid hydration mismatches
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: targetTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return formatter.format(date);
      } catch (error) {
        // Fallback to UTC time if timezone is invalid
        const utcHours = date.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${utcHours}:${utcMinutes}`;
      }
    }
    
    // For other pages, use consistent timezone formatting
    try {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: targetTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return formatter.format(date);
    } catch (error) {
      // Fallback to UTC time if timezone is invalid
      const utcHours = date.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${utcHours}:${utcMinutes}`;
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
    e.stopPropagation();
    console.log('Team clicked, opening match page:', match.id);
    const matchUrl = `/match/${match.id}`;
    console.log('Opening match URL:', matchUrl);
    window.open(matchUrl, '_blank');
  };

  console.log('🎯 MatchCard rendering for match:', match.id, 'onClick provided:', !!onClick);
  
  // Show loading skeleton only if match is completely missing
  if (!match) {
    return <MatchCardSkeleton />;
  }
  
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
        className={`group w-full h-full cursor-pointer relative py-1 px-2 md:py-0 md:px-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none ${isLive ? 'border-l-0' : ''}`}
        tabIndex={0}
        aria-label={`View details for ${match.home_team?.name} vs ${match.away_team?.name}`}
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
        
        {/* Mobile: Hybrid layout with CSS Grid and Flexbox fallback */}
        <div 
          className={`grid grid-cols-[minmax(30px,5%)_minmax(130px,42%)_minmax(140px,45%)_minmax(32px,8%)_minmax(20px,2%)] gap-1 md:hidden w-full h-full items-center py-0.5 px-1 ${
            isLive ? 'border-l-4 border-l-red-500' : ''
          }`}
          style={{ 
            minWidth: '320px', // Ensure minimum width for proper layout
            overflow: 'hidden', // Prevent horizontal overflow
            display: 'grid', // Force grid display
            gridTemplateColumns: 'minmax(30px, 5%) minmax(130px, 42%) minmax(140px, 45%) minmax(32px, 8%) minmax(20px, 2%)'
          }}
        >
          {/* Column 1: Time + Calendar Button (5%) */}
          <div className="flex flex-col items-center justify-center py-0.5 px-0.5">
            <span className="text-[9px] font-bold text-gray-900 dark:text-white text-center">
              {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' || useShortDateFormat
                ? formatMatchDate(match.start_time)
                : formatTimeConsistently(match.start_time, getTargetTimezone())}
            </span>
            <div className="flex items-center justify-center mt-0">
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
                const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
                const matchDate = new Date(match.start_time);
                const matchDateUTC = new Date(Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate()));
                
                // If match is not today, show time below date
                if (matchDateUTC.getTime() !== todayUTC.getTime()) {
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

          {/* Column 2: Teams (42%) */}
          <div 
            className="flex flex-col gap-0 min-w-0 overflow-hidden py-0.5 px-1" 
            style={{ 
              minWidth: '130px', 
              maxWidth: '100%',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            <div className="flex items-center gap-1 whitespace-nowrap">
              <div className="w-[20px] h-[20px] flex-shrink-0">
                <OptimizedTeamLogo 
                  logoUrl={match.home_team?.team_logo_url} 
                  teamName={match.home_team?.name || 'Unknown'} 
                  size={20}
                />
              </div>
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.home_team?.name, match.home_team?.id);
                }}
                className={`text-xs inline-block text-left truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-900 dark:text-white font-normal' :
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'font-black text-gray-900 dark:text-white' : 'font-light text-gray-500 dark:text-gray-400') :
                  'font-normal text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.home_team?.name}
              </button>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <div className="w-[20px] h-[20px] flex-shrink-0">
                <OptimizedTeamLogo 
                  logoUrl={match.away_team?.team_logo_url} 
                  teamName={match.away_team?.name || 'Unknown'} 
                  size={20}
                />
              </div>
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.away_team?.name, match.away_team?.id);
                }}
                className={`text-xs inline-block text-left truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
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

          {/* Column 3: Odds or TV (45%) */}
          <div 
            className="flex items-center justify-start gap-1 py-0.5 px-1" 
            style={{ 
              minWidth: '140px', 
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            {showOdds ? (
              // Odds Mode - Clickable buttons like the screenshot (with sample data)
              <div className="flex gap-1 w-full">
                {(() => {
                  // Sample odds data for demonstration
                  const sampleOdds = [
                    { key: 'home', label: '1', value: '1.50', operator: { name: 'Bet365', url: 'https://bet365.com' } },
                    { key: 'draw', label: 'X', value: '3.20', operator: { name: 'Bet365', url: 'https://bet365.com' } },
                    { key: 'away', label: '2', value: '1.80', operator: { name: 'Bet365', url: 'https://bet365.com' } }
                  ];
                  
                  return sampleOdds.map(({ key, label, value, operator }) => {
                    const isWinningOdds = match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                      (key === 'home' && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score) ||
                      (key === 'away' && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score) : false;
                    
                    return (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (operator?.url) {
                            window.open(operator.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className={`flex items-center justify-center flex-1 py-2 px-1 rounded text-[10px] font-bold transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm ${
                          isWinningOdds ? 
                          'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        title={`Best odds for ${label} by ${operator?.name || 'Unknown'}`}
                      >
                        <span className="text-[10px] font-bold">{value}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            ) : (
              // TV Channels Mode
              <div className="flex items-center gap-0.5 w-full overflow-hidden">
                {(() => {
                  const broadcasters = match.Event_Broadcasters ? match.Event_Broadcasters.filter((eb: any) => eb.Broadcasters && eb.Broadcasters.name) : [];
                  const visible = broadcasters.slice(0, 3);
                  const hasMore = broadcasters.length > 3;
                  
                  return (
                    <>
                      {visible.map((eb: any, idx: number) => {
                        const b = eb.Broadcasters;
                        return (
                          <div key={idx} className="w-4 h-4 flex-shrink-0">
                            <BroadcasterLogo
                              logoUrl={b.logo_url}
                              broadcasterName={b.name}
                              affiliateUrl={b.affiliate_url}
                              size="sm"
                              className="!w-4 !h-4"
                              showLabel={false}
                            />
                          </div>
                        );
                      })}
                      {hasMore && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          +{broadcasters.length - 3}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Column 4: Result (8%) */}
          <div className="flex flex-col items-center justify-center py-0.5">
            {match.home_score !== null && match.home_score !== undefined && match.away_score !== null && match.away_score !== undefined ? (
              <>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {match.home_score}
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {match.away_score}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-gray-400">-</span>
                <span className="text-xs text-gray-400">-</span>
              </>
            )}
          </div>

          {/* Column 5: Star Button (2%) */}
          <div className="flex items-center justify-center py-0.5">
            {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ? (
              <div className="w-4 h-4"></div> // Empty space for finished matches
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStarToggle) onStarToggle(match.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  isStarred 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
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
                  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
                  const matchDate = new Date(match.start_time);
                  const matchDateUTC = new Date(Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate()));
                  
                  // If match is not today, show time below date
                  if (matchDateUTC.getTime() !== todayUTC.getTime()) {
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
            <div className="flex items-center gap-1 whitespace-nowrap">
              <TeamLogo 
                logoUrl={match.home_team?.team_logo_url} 
                teamName={match.home_team?.name || 'Unknown'} 
                size="sm"
                className="w-[14px] h-[14px]"
              />
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.home_team?.name, match.home_team?.id);
                }}
                className={`text-sm inline-block text-left whitespace-nowrap truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-300 font-normal' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'font-black text-gray-900 dark:text-white' : 'font-light text-gray-500 dark:text-gray-400') :
                  'font-normal text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.home_team?.name}
              </button>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <TeamLogo 
                logoUrl={match.away_team?.team_logo_url} 
                teamName={match.away_team?.name || 'Unknown'} 
                size="sm"
                className="w-[14px] h-[14px]"
              />
              <button
                data-team-click="true"
                onClick={(e) => {
                  handleTeamClick(e, match.away_team?.name, match.away_team?.id);
                }}
                className={`text-sm inline-block text-left whitespace-nowrap truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
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
                      className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 hover:scale-105 hover:drop-shadow-sm transition-all duration-100 ease-in-out min-w-[58px] min-h-[36px]"
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