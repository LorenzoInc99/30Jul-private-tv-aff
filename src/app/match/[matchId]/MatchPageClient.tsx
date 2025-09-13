"use client";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamForm, transformOddsByBookmaker } from '@/lib/database-adapter';
import TeamLogo from '@/components/TeamLogo';
import BroadcasterLogo from '@/components/BroadcasterLogo';
import BookmakerLogo from '@/components/BookmakerLogo';
import TeamFormRectangles from '@/components/TeamFormRectangles';
import OddsComparisonTable from '@/components/OddsComparisonTable';
import { trackBroadcasterClick, formatClickCount, initializeClickTracking } from '@/lib/broadcaster-tracking';





function MatchSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
          {/* Status skeleton */}
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          
          {/* Teams skeleton */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
            <div className="flex flex-col items-center w-full md:w-1/3">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center w-full md:w-1/3">
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
            
            <div className="flex flex-col items-center w-full md:w-1/3">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchPageClient({ match }: { match: any }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showAllBroadcasters, setShowAllBroadcasters] = useState(false);
  const [clickCounts, setClickCounts] = useState<{ [key: number]: number }>({});

  const timezone = searchParams.get('timezone') || 'auto';

  // Initialize click tracking and fetch click counts
  useEffect(() => {
    // Initialize the tracking system
    initializeClickTracking();
    
    // Fetch current click counts
    const fetchClickCounts = async () => {
      try {
        const response = await fetch('/api/broadcaster-clicks');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.clickCounts) {
            const counts: { [key: number]: number } = {};
            data.clickCounts.forEach((item: any) => {
              counts[item.broadcaster_id] = item.click_count;
            });
            setClickCounts(counts);
          }
        }
      } catch (error) {
        console.error('Error fetching click counts:', error);
      }
    };
    
    fetchClickCounts();
  }, []);
  
  const getTargetTimezone = () => {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  };

  // Custom date formatter to avoid hydration mismatches
  const formatDateConsistently = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${weekday} ${day} ${month} ${year}`;
  };

  // Custom time formatter to avoid hydration mismatches
  const formatTimeConsistently = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Custom short date formatter (e.g., "Aug 1")
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getMatchStatus = () => {
    if (match?.status === 'Live') return { text: 'LIVE', color: 'bg-red-500' };
    if (match?.status === 'Finished') return { text: 'FULL TIME', color: 'bg-gray-500' };
    if (match?.status === 'Scheduled') return { text: 'UPCOMING', color: 'bg-blue-500' };
    return { text: match?.status || 'Unknown', color: 'bg-gray-400' };
  };

  if (loading) {
    return <MatchSkeleton />;
  }

  const status = getMatchStatus();
  const homeTeamName = match.home_team?.name || 'Unknown Home Team';
  const awayTeamName = match.away_team?.name || 'Unknown Away Team';
  const hasOdds = match.Odds && match.Odds.length > 0;
  const hasBroadcasters = match.Event_Broadcasters && match.Event_Broadcasters.length > 0;

  // Filter out broadcasters without names
  const validBroadcasters = hasBroadcasters 
    ? match.Event_Broadcasters
        .map((eb: any) => eb.Broadcasters)
        .filter((broadcaster: any) => broadcaster?.name)
    : [];

  const displayedBroadcasters = showAllBroadcasters 
    ? validBroadcasters 
    : validBroadcasters.slice(0, 5);

  const remainingCount = validBroadcasters.length - 5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Main Content */}
        <main className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Match Header */}
          <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-2 w-full">
            <div className="px-6 py-3 bg-indigo-600 text-white text-sm font-semibold uppercase tracking-wide">
              <Link 
                href={`/competition/${match.Competitions?.id}-${match.Competitions?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                className="text-white hover:text-indigo-200 transition-colors duration-200"
                aria-label={`Go to competition page for ${match.Competitions?.name}`}
              >
                {match.Competitions?.name}
              </Link>
            </div>
            <div className="p-6">
              {/* Teams and Score */}
              <div className="flex flex-col items-center justify-center mb-6">
                
                {/* Teams and Score Row - Grid layout for perfect alignment */}
                <div className="grid grid-cols-3 items-center justify-center w-full max-w-4xl gap-2 md:gap-8">
                  {/* Home Team */}
                  <div className="flex flex-col items-center justify-center min-h-[200px] md:min-h-[240px]">
                    {/* Logo Row */}
                    <div className="flex items-center justify-center h-24 md:h-28 mb-2">
                      <TeamLogo 
                        logoUrl={match.home_team?.team_logo_url} 
                        teamName={homeTeamName} 
                        size="xl" 
                      />
                    </div>
                    {/* Team Name Row */}
                    <div className="flex items-center justify-center h-12 md:h-16 mb-2 px-1 md:px-2">
                      <Link
                        href={`/team/${homeTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                        className={`text-sm md:text-2xl text-center break-words leading-tight transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-lg ${
                          match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                            (match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 
                              'font-black text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400' : 
                              'font-light text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400') :
                          'font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        aria-label={`Go to ${homeTeamName} team page`}
                      >
                        {homeTeamName}
                      </Link>
                    </div>
                    {/* Form Row */}
                    <div className="flex items-center justify-center h-6">
                      <TeamFormRectangles
                        teamId={match.home_team_id}
                        matchStartTime={match.start_time}
                      />
                    </div>
                  </div>
                  
                  {/* Center content */}
                  <div className="flex flex-col items-center justify-center min-h-[200px] md:min-h-[240px] px-2 md:px-4">
                    {(match.status === 'Full Time' || match.status === 'Live' || 
                      match.status === 'After Extra Time' || match.status === 'After Penalties' ||
                      (match.home_score !== null && match.away_score !== null)) ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                          {match.home_score || 0} - {match.away_score || 0}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {match.status === 'Live' ? 'LIVE' : 'FULL TIME'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                          {formatTimeConsistently(match.start_time)}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatShortDate(match.start_time)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Away Team */}
                  <div className="flex flex-col items-center justify-center min-h-[200px] md:min-h-[240px]">
                    {/* Logo Row */}
                    <div className="flex items-center justify-center h-24 md:h-28 mb-2">
                      <TeamLogo 
                        logoUrl={match.away_team?.team_logo_url} 
                        teamName={awayTeamName} 
                        size="xl" 
                      />
                    </div>
                    {/* Team Name Row */}
                    <div className="flex items-center justify-center h-12 md:h-16 mb-2 px-1 md:px-2">
                      <Link
                        href={`/team/${awayTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                        className={`text-sm md:text-2xl text-center break-words leading-tight transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-lg ${
                          match.status === 'Finished' || match.status === 'Full Time' || match.status === 'After Extra Time' || match.status === 'After Penalties' ?
                            (match.away_score !== null && match.away_score !== null && match.away_score > match.home_score ? 
                              'font-black text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400' : 
                              'font-light text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400') :
                          'font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        aria-label={`Go to ${awayTeamName} team page`}
                      >
                        {awayTeamName}
                      </Link>
                    </div>
                    {/* Form Row */}
                    <div className="flex items-center justify-center h-6">
                      <TeamFormRectangles
                        teamId={match.away_team_id}
                        matchStartTime={match.start_time}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Broadcasters */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left">
                  Broadcasters ({validBroadcasters.length})
                </h3>
                {hasBroadcasters ? (
                  <div className="space-y-2">
                    {displayedBroadcasters.map((broadcaster: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                        {/* Logo Column */}
                        <div className="flex-shrink-0 w-12">
                          {broadcaster.logo_url ? (
                            <Image
                              src={broadcaster.logo_url}
                              alt={`${broadcaster.name} logo`}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-contain rounded bg-white border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                // Fallback to letter if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-8 h-8 flex items-center justify-center rounded bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                      ${broadcaster.name.charAt(0).toUpperCase()}
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                              {broadcaster.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Broadcaster Name Column */}
                        <div className="flex-1 px-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {broadcaster.name}
                          </span>
                        </div>
                        
                        {/* Click Here Button Column */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {/* Social Validation Badge - Always Visible */}
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                            <span>👁️</span>
                            <span>{clickCounts[broadcaster.id] || 0}</span>
                          </div>
                          
                          {broadcaster.affiliate_url ? (
                            <button
                              onClick={() => {
                                // Debug: Log broadcaster info
                                console.log('Broadcaster clicked:', broadcaster);
                                console.log('Broadcaster ID:', broadcaster.id);
                                console.log('Broadcaster name:', broadcaster.name);
                                
                                // Track the click
                                trackBroadcasterClick(broadcaster.id);
                                // Open the link
                                window.open(broadcaster.affiliate_url, '_blank', 'noopener,noreferrer');
                              }}
                              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
                            >
                              Click here
                            </button>
                          ) : (
                            <span className="px-4 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-600 rounded-lg">
                              No link
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {!showAllBroadcasters && remainingCount > 0 && (
                      <button
                        onClick={() => setShowAllBroadcasters(true)}
                        className="w-full mt-3 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
                      >
                        See more ({remainingCount} more)
                      </button>
                    )}
                    
                    {showAllBroadcasters && validBroadcasters.length > 5 && (
                      <button
                        onClick={() => setShowAllBroadcasters(false)}
                        className="w-full mt-3 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No broadcasters available</p>
                )}
              </div>


            </div>
          </div>

          {/* Odds Section */}
          {hasOdds && match.status !== 'Finished' && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Odds Comparison (1X2)</h3>
              <p className="text-left text-gray-600 dark:text-gray-400 text-xs mb-4">
                Explore the most competitive betting odds for the {homeTeamName} vs {awayTeamName} match. 
                Compare all football betting options in the table below.
              </p>

              <OddsComparisonTable odds={match.Odds} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
            </div>
          )}

          {/* No Odds Message */}
          {(!hasOdds || match.status === 'Finished') && (
            <div className="mt-8 text-center py-5 text-gray-500 dark:text-gray-400">
              No 1X2 odds available for this match.
            </div>
          )}

          {/* SEO Content Section */}
          <section className="bg-gray-100 dark:bg-gray-800 py-6 mt-8">
            <div className="max-w-4xl mx-auto">
              {/* Match Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {homeTeamName} vs {awayTeamName} - {match.Competitions?.name || 'Match'}
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p><strong>Date:</strong> {formatDateConsistently(match.start_time)}</p>
                  <p><strong>Time:</strong> {formatTimeConsistently(match.start_time)}</p>
                  <p><strong>Status:</strong> {match.status}</p>
                  {match.home_score !== null && match.away_score !== null && (
                    <p><strong>Score:</strong> {match.home_score} - {match.away_score}</p>
                  )}
                </div>
              </div>

              {/* Where to Watch */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Where to Watch {homeTeamName} vs {awayTeamName}
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {hasBroadcasters ? (
                    <p>The {homeTeamName} vs {awayTeamName} match will be broadcast on {match.Event_Broadcasters.length} channel{match.Event_Broadcasters.length > 1 ? 's' : ''}.</p>
                  ) : (
                    <p>Broadcasting details for {homeTeamName} vs {awayTeamName} will be confirmed closer to kick-off.</p>
                  )}
                </div>
              </div>

              {/* Best Odds Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Best Odds for {homeTeamName} vs {awayTeamName}
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {hasOdds ? (
                    <p>Compare odds from {match.Odds.length} bookmaker{match.Odds.length > 1 ? 's' : ''} for the {homeTeamName} vs {awayTeamName} match.</p>
                  ) : (
                    <p>Odds for {homeTeamName} vs {awayTeamName} will be available closer to kick-off.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Custom CSS for odds table and form circles */}
      <style jsx>{`
        .odds-table th, .odds-table td {
          border-bottom: 1px solid #e5e7eb;
        }
        .dark .odds-table th, .dark .odds-table td {
          border-bottom: 1px solid #374151;
        }
        .odds-table th {
          cursor: pointer;
          user-select: none;
        }
        .odds-table th:first-child, .odds-table td:first-child {
          padding-left: 1rem;
        }
        .odds-table td:first-child {
          text-align: left;
        }
        .odds-table th:last-child, .odds-table td:last-child {
          padding-right: 1rem;
        }
        .odds-cell {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-align: center;
          font-weight: 600;
          min-width: 60px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #e2e8f0;
          color: #1e293b;
          text-decoration: none;
        }
        .dark .odds-cell {
          background: linear-gradient(135deg, #334155 0%, #475569 100%);
          border: 1px solid #475569;
          color: #f1f5f9;
        }
        .odds-cell:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .highlight-best-odd {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
          color: #166534 !important;
          font-weight: bold !important;
          border: 2px solid #22c55e !important;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
          transform: scale(1.05) !important;
        }
        .dark .highlight-best-odd {
          background: linear-gradient(135deg, #14532d 0%, #166534 100%) !important;
          color: #dcfce7 !important;
          border: 2px solid #22c55e !important;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4) !important;
        }
        .sort-arrow {
          display: inline-block;
          margin-left: 0.25rem;
          font-size: 0.75em;
          vertical-align: middle;
          opacity: 0.7;
        }
        .odds-table th:hover .sort-arrow {
          opacity: 1;
        }
      `}</style>
    </div>
  );
} 