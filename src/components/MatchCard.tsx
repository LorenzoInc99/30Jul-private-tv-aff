import React, { useState } from 'react';

export default function MatchCard({ match, timezone, isExpanded, onExpandToggle, onClick, hideCompetitionName = false }: {
  match: any;
  timezone: string;
  isExpanded: boolean;
  onExpandToggle: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  hideCompetitionName?: boolean;
}) {
  const [showAllStreams, setShowAllStreams] = useState(false);
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }
  function slugify(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  return (
    <div className="overflow-x-auto w-full md:w-full">
      <div
        className={`group w-full transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer`}
        tabIndex={0}
        aria-label={`View details for ${match.home_team?.name} vs ${match.away_team?.name}`}
        role="button"
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); }}
      >
        {/* Mobile: Compact row layout */}
        <div className="flex flex-col p-2 md:hidden w-full">
          {/* Time and TV icon row */}
          <div className="flex flex-row items-center justify-between mb-0 w-full">
            <span className="text-xs font-bold text-left">
              {match.status === 'Finished'
                ? 'FT'
                : new Date(match.start_time).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: getTargetTimezone(),
                  })}
            </span>
            <button
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={isExpanded ? 'Hide TV channels' : 'Show TV channels'}
              onClick={onExpandToggle}
              tabIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-indigo-500"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            </button>
          </div>
          {/* Teams, odds, result row */}
          <div className={`grid ${match.status !== 'Finished' ? 'grid-cols-[minmax(0,1fr)_minmax(0,180px)_3rem]' : 'grid-cols-[minmax(0,1fr)_3rem]'} items-center w-full gap-2`}>
            {/* Teams column */}
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-xs font-semibold truncate">{match.home_team?.name}</span>
              <span className="text-xs font-semibold truncate">{match.away_team?.name}</span>
            </div>
            {/* Odds column (only if not finished) */}
            {match.status !== 'Finished' && (
              <div className="flex flex-row items-center justify-between gap-1 min-w-[120px]">
                {(() => {
                  type OddKey = '1' | 'X' | '2';
                  type BestOdds = { [K in OddKey]: { odds: number; operator: any | null } };
                  const best: BestOdds = { '1': { odds: 0, operator: null }, 'X': { odds: 0, operator: null }, '2': { odds: 0, operator: null } };
                  (match.Odds || []).forEach((odd: any) => {
                    if (odd.Operators) {
                      if (odd.home_win && odd.home_win > best['1'].odds) best['1'] = { odds: odd.home_win, operator: odd.Operators };
                      if (odd.draw && odd.draw > best['X'].odds) best['X'] = { odds: odd.draw, operator: odd.Operators };
                      if (odd.away_win && odd.away_win > best['2'].odds) best['2'] = { odds: odd.away_win, operator: odd.Operators };
                    }
                  });
                  return (['1', 'X', '2'] as OddKey[]).map(type => {
                    const b = best[type];
                    return b.operator ? (
                      <a
                        key={type}
                        href={b.operator.affiliate_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors min-w-[64px] min-h-[36px]"
                        onClick={e => e.stopPropagation()}
                        tabIndex={0}
                        aria-label={`Best odds for ${type} by ${b.operator.name}`}
                      >
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{parseFloat(b.odds as any).toFixed(2)}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight text-ellipsis overflow-hidden whitespace-nowrap w-full">{b.operator.name}</span>
                      </a>
                    ) : (
                      <div key={type} className="flex flex-col items-center justify-center text-center w-full px-0.5 py-0.5 min-w-[32px]" aria-label="No odds available">
                        <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
            {/* Score column */}
            <span className="flex flex-col items-center justify-center text-xs text-center font-bold w-12 block">
              {match.status === 'Finished' || match.status === 'Live' ? (
                <>
                  <span>{match.home_score}</span>
                  <span>{match.away_score}</span>
                </>
              ) : (
                <>
                  <span>-</span>
                  <span>-</span>
                </>
              )}
            </span>
          </div>
          {/* Expanded TV channels (mobile) */}
          {isExpanded && (
            <div className="md:hidden px-4 pb-2">
              {match.Event_Broadcasters && match.Event_Broadcasters.length > 0 ? (
                <div className="flex flex-col gap-1 mt-1">
                  {match.Event_Broadcasters.map((eb: any, i: number) => {
                    const b = eb.Broadcasters;
                    if (!b?.name) return null;
                    return b.affiliate_url ? (
                      <a
                        key={i}
                        href={b.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-50 dark:bg-indigo-900 rounded px-1 py-0.5 text-[12px] text-center text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                        aria-label={`Watch on ${b.name}`}
                        onClick={e => { e.stopPropagation(); }}
                      >
                        {b.name}
                      </a>
                    ) : (
                      <span key={i} className="bg-indigo-50 dark:bg-indigo-900 rounded px-1 py-0.5 text-[12px] text-center text-gray-400">
                        {b.name}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-gray-400 text-[12px]">No TV</span>
              )}
            </div>
          )}
        </div>
        {/* Desktop: Row layout */}
        <div className="hidden md:grid w-full py-2 px-3 relative md:grid-cols-[3.5rem_12rem_13rem_3.5rem_13rem] items-center">
          {/* Time */}
          <div className="text-xs font-bold text-left"> {/* Time column, fixed width by grid */}
            {match.status === 'Finished'
              ? 'FT'
              : new Date(match.start_time).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: getTargetTimezone(),
                })}
          </div>
          {/* Teams with logos */}
          <div className="flex flex-col"> {/* Teams column, fixed width by grid */}
            {/* Competition name (bigger font) */}
            {!hideCompetitionName && match.competition?.name && (
              <div className="text-base font-bold text-gray-900 dark:text-white mb-1">{match.competition.name}</div>
            )}
            <span className="font-semibold text-xs truncate">{match.home_team?.name}</span>
            <span className="font-semibold text-xs truncate">{match.away_team?.name}</span>
          </div>
          {/* Odds */}
          <div className="flex flex-row items-center gap-1"> {/* Odds column, fixed width by grid */}
            {match.status !== 'Finished' ? (
              (() => {
                type OddKey = '1' | 'X' | '2';
                type BestOdds = { [K in OddKey]: { odds: number; operator: any | null } };
                const best: BestOdds = { '1': { odds: 0, operator: null }, 'X': { odds: 0, operator: null }, '2': { odds: 0, operator: null } };
                (match.Odds || []).forEach((odd: any) => {
                  if (odd.Operators) {
                    if (odd.home_win && odd.home_win > best['1'].odds) best['1'] = { odds: odd.home_win, operator: odd.Operators };
                    if (odd.draw && odd.draw > best['X'].odds) best['X'] = { odds: odd.draw, operator: odd.Operators };
                    if (odd.away_win && odd.away_win > best['2'].odds) best['2'] = { odds: odd.away_win, operator: odd.Operators };
                  }
                });
                // Always render 3 boxes for alignment
                return (['1', 'X', '2'] as OddKey[]).map(type => {
                  const b = best[type];
                  return b.operator ? (
                    <a
                      key={type}
                      href={b.operator.affiliate_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors min-w-[64px] min-h-[36px]"
                      onClick={e => e.stopPropagation()}
                      tabIndex={0}
                      aria-label={`Best odds for ${type} by ${b.operator.name}`}
                    >
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{parseFloat(b.odds as any).toFixed(2)}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight text-ellipsis overflow-hidden whitespace-nowrap w-full">{b.operator.name}</span>
                    </a>
                  ) : (
                    <div key={type} className="flex flex-col items-center justify-center text-center w-full px-0.5 py-0.5 min-w-[64px] min-h-[36px]" aria-label="No odds available">
                      <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
                    </div>
                  );
                });
              })()
            ) : (
              // Always render 3 empty boxes for finished matches for alignment
              [0,1,2].map(idx => (
                <div key={idx} className="flex flex-col items-center justify-center text-center w-full px-0.5 py-0.5 min-w-[64px] min-h-[36px]" aria-label="No odds available">
                  <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
                </div>
              ))
            )}
          </div>
          {/* Score */}
          <div className="flex flex-col items-center justify-center font-semibold text-xs text-gray-800 dark:text-gray-200"> {/* Result column, fixed width by grid */}
            {match.status === 'Finished' || match.status === 'Live' ? (
              <>
                <span>{match.home_score}</span>
                <span>{match.away_score}</span>
              </>
            ) : (
              <>
                <span>-</span>
                <span>-</span>
              </>
            )}
          </div>
          {/* TV Stream Logos (fixed-width, up to 5, aligned right, fill leftward) */}
          <div className="flex flex-row-reverse items-center gap-2 justify-end"> {/* TV streams column, fixed width by grid */}
            {(() => {
              const broadcasters = match.Event_Broadcasters ? match.Event_Broadcasters.filter((eb: any) => eb.Broadcasters && eb.Broadcasters.name) : [];
              const count = broadcasters.length;
              const maxToShow = showAllStreams ? 5 : 5;
              const visible = broadcasters.slice(0, 5).slice(-maxToShow);
              return (
                <>
                  {count > 5 && !showAllStreams && (
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 text-xl font-bold text-gray-700 dark:text-gray-200 transition-colors"
                      aria-label="Show all TV streams"
                      onClick={e => { e.stopPropagation(); setShowAllStreams(true); }}
                      tabIndex={0}
                    >
                      &gt;
                    </button>
                  )}
                  {visible.map((eb: any, idx: number) => {
                    const b = eb.Broadcasters;
                    return (
                      <a
                        key={b.name + idx}
                        href={b.affiliate_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                        aria-label={`Watch on ${b.name}`}
                        onClick={e => { e.stopPropagation(); }}
                      >
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} className="w-8 h-8 object-contain rounded bg-white border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <span className="w-8 h-8 inline-block rounded bg-white border border-gray-200 dark:border-gray-700" />
                        )}
                      </a>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
} 