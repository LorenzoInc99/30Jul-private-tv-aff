import React from 'react';
import { getBestOddsFromTransformed } from '../lib/database-adapter';
import TeamLogo from './TeamLogo';
import CountryFlag from './CountryFlag';
import BroadcasterLogo from './BroadcasterLogo';
import { slugify } from '../lib/utils';

export default function MatchCard({ match, timezone, isExpanded, onExpandToggle, onClick, hideCompetitionName = false, showOdds = true, showTv = true }: {
  match: any;
  timezone: string;
  isExpanded: boolean;
  onExpandToggle: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  hideCompetitionName?: boolean;
  showOdds?: boolean;
  showTv?: boolean;
}) {
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }
  


  // Check if match is live - including both "Live" status and actual live match statuses
  const isLive = match.status === 'Live' || 
                 match.status === '1st Half' || 
                 match.status === '2nd Half' || 
                 match.status === 'Half Time' ||
                 match.status === 'ET - 2nd Half' ||
                 match.status === 'Extra Time' ||
                 match.status === 'Penalties';

  const handleTeamClick = (e: React.MouseEvent, teamName: string) => {
    e.stopPropagation();
    console.log('Team clicked:', teamName);
    const teamSlug = slugify(teamName);
    console.log('Generated slug:', teamSlug);
    const teamUrl = `/team/${teamSlug}`;
    console.log('Opening URL:', teamUrl);
    window.open(teamUrl, '_blank');
  };

  return (
    <div className="w-full md:w-full">
      <div
        className={`group w-full transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer relative ${isLive ? 'border-l-0' : ''}`}
        tabIndex={0}
        aria-label={`View details for ${match.home_team?.name} vs ${match.away_team?.name}`}
        role="button"
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); }}
      >
        {/* Live Match Indicator */}
        {isLive && (
          <div className="absolute left-0 top-1 bottom-1 w-2 bg-orange-500 rounded-r-xl"></div>
        )}
        
        {/* Mobile: Enhanced compact layout */}
        <div className={`flex items-center p-2 gap-2 md:hidden w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer relative ${
          isLive ? 'border-l-4 border-l-red-500' : ''
        }`}>
          {/* Time Column - Compact and close to border */}
          <div className="flex-shrink-0 w-12 flex flex-col items-start">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties'
                ? 'FT'
                : new Date(match.start_time).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: getTargetTimezone(),
                  })}
            </span>
            <span className={`text-xs font-medium ${
              isLive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {isLive ? '-' : (match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ? 'FT' : '-')}
            </span>
          </div>

          {/* Teams Column - Two rows, closer together */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex-shrink-0">
                <TeamLogo 
                  logoUrl={match.home_team?.team_logo_url} 
                  teamName={match.home_team?.name || 'Unknown'} 
                  size="sm" 
                />
              </div>
              <button
                onClick={(e) => handleTeamClick(e, match.home_team?.name)}
                className={`text-sm font-medium truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-900 dark:text-white' :
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300') :
                  'text-gray-700 dark:text-gray-300'
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
                onClick={(e) => handleTeamClick(e, match.away_team?.name)}
                className={`text-sm font-medium truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-900 dark:text-white' :
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.away_score > match.home_score ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300') :
                  'text-gray-700 dark:text-gray-300'
                }`}
              >
                {match.away_team?.name}
              </button>
            </div>
          </div>

          {/* Dynamic Right Column - Odds or TV Channels */}
          <div className="flex-shrink-0 w-20 mr-8">
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
                        <div className="w-5 h-5 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            +{broadcasters.length - 3}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Score Column */}
          <div className="flex-shrink-0 w-8 text-center flex flex-col gap-0.5">
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

          {/* Favorite Star */}
          <div className="flex-shrink-0 w-6 flex justify-center">
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442c.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Desktop: Row layout - Grid for alignment, absolute for flexibility */}
        <div className="hidden md:grid w-full py-0 px-3 relative md:grid-cols-[3.5rem_11rem_1rem] items-center">
          {/* Time */}
          <div className="text-xs font-bold text-left"> {/* Time column, fixed width by grid */}
            <span>
              {match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties'
                ? 'FT'
                : new Date(match.start_time).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: getTargetTimezone(),
                  })}
            </span>
          </div>
          {/* Teams with logos */}
          <div className="flex flex-col"> {/* Teams column, fixed width by grid */}
            {/* Competition name with country flag */}
            {!hideCompetitionName && match.competition?.name && (
              <div className="flex items-center gap-2 mb-1">
                {match.Competitions?.country && (
                  <CountryFlag 
                    imagePath={match.Competitions.country.image_path} 
                    countryName={match.Competitions.country.name} 
                    size="sm" 
                  />
                )}
                <div className="text-base font-bold text-gray-900 dark:text-white">{match.competition.name}</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <TeamLogo 
                logoUrl={match.home_team?.team_logo_url} 
                teamName={match.home_team?.name || 'Unknown'} 
                size="sm" 
              />
              <button
                onClick={(e) => handleTeamClick(e, match.home_team?.name)}
                className={`text-sm truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-300 font-bold' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'font-extrabold' : 'font-normal') :
                  'font-bold'
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
                onClick={(e) => handleTeamClick(e, match.away_team?.name)}
                className={`text-sm truncate transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                  isLive ? 'text-gray-300 font-bold' : 
                  match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                    (match.home_score !== null && match.away_score !== null && match.away_score > match.home_score ? 'font-extrabold' : 'font-normal') :
                  'font-bold'
                }`}
              >
                {match.away_team?.name}
              </button>
            </div>
          </div>
          {/* Odds - Always rendered, conditionally visible */}
          <div className={`absolute right-65 top-1/2 transform -translate-y-1/2 flex flex-row items-center gap-1 ${!showOdds ? 'invisible' : ''}`}>
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
          {/* TV Stream Logos - Always rendered, conditionally visible */}
          <div className={`absolute right-25 top-1/2 transform -translate-y-1/2 flex flex-row-reverse items-center gap-1 justify-end overflow-hidden ${!showTv ? 'invisible' : ''}`}>
            {(() => {
              const broadcasters = match.Event_Broadcasters ? match.Event_Broadcasters.filter((eb: any) => eb.Broadcasters && eb.Broadcasters.name) : [];
              const count = broadcasters.length;
              const maxToShow = 3; // Reduced to 3 visible channels to accommodate bigger logos
              const visible = broadcasters.slice(0, maxToShow);
              const hasMore = count > maxToShow;
              
              return (
                <>
                  {/* "See more" indicator */}
                  {hasMore && (
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      +{count - maxToShow}
                    </div>
                  )}
                  
                  {/* Visible channels */}
                  {visible.map((eb: any, idx: number) => {
                    const b = eb.Broadcasters;
                    return (
                      <div
                        key={b.name + idx}
                        className="flex-shrink-0 hover:scale-105 hover:drop-shadow-sm transition-all duration-100 ease-in-out"
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
          
          {/* Score - Positioned absolutely next to star */}
          <div className="absolute right-11 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center font-semibold text-sm text-gray-800 dark:text-gray-200">
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
          
          {/* Favorite Star - Positioned absolutely at the right edge */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442c.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 