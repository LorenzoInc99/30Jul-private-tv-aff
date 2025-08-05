"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamForm, transformOddsByBookmaker } from '@/lib/database-adapter';
import TeamLogo from '@/components/TeamLogo';
import BroadcasterLogo from '@/components/BroadcasterLogo';
import BookmakerLogo from '@/components/BookmakerLogo';
import TeamFormRectangles from '@/components/TeamFormRectangles';


// Best odds summary component
function BestOddsSummary({ odds }: { odds: any[] }) {
  const findBestOdds = (oddsArray: any[]) => {
    const bestOdds = {
      '1': { odds: 0, operator: null as any },
      'X': { odds: 0, operator: null as any },
      '2': { odds: 0, operator: null as any }
    };

    if (!oddsArray) return bestOdds;

    oddsArray.forEach(oddSet => {
      if (oddSet.Operators) {
        if (oddSet.home_win && oddSet.home_win > bestOdds['1'].odds) {
          bestOdds['1'] = { odds: oddSet.home_win, operator: oddSet.Operators };
        }
        if (oddSet.draw && oddSet.draw > bestOdds['X'].odds) {
          bestOdds['X'] = { odds: oddSet.draw, operator: oddSet.Operators };
        }
        if (oddSet.away_win && oddSet.away_win > bestOdds['2'].odds) {
          bestOdds['2'] = { odds: oddSet.away_win, operator: oddSet.Operators };
        }
      }
    });

    return bestOdds;
  };

  const bestOdds = findBestOdds(odds);

  return (
    <div className="grid grid-cols-3 gap-2 text-center p-4">
      <div className="flex flex-col items-center py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Home (1)</span>
        <a
          href={bestOdds['1'].operator?.affiliate_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-base text-indigo-600 dark:text-indigo-400 hover:underline"
          aria-label={`Go to ${bestOdds['1'].operator?.name || 'bookmaker'} for best home odds`}
        >
          {bestOdds['1'].odds > 0 ? bestOdds['1'].odds.toFixed(2) : '-'}
        </a>
        <span className="text-xs text-gray-500 dark:text-gray-400">{bestOdds['1'].operator?.name || 'N/A'}</span>
      </div>
      <div className="flex flex-col items-center py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Draw (X)</span>
        <a
          href={bestOdds['X'].operator?.affiliate_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-base text-indigo-600 dark:text-indigo-400 hover:underline"
          aria-label={`Go to ${bestOdds['X'].operator?.name || 'bookmaker'} for best draw odds`}
        >
          {bestOdds['X'].odds > 0 ? bestOdds['X'].odds.toFixed(2) : '-'}
        </a>
        <span className="text-xs text-gray-500 dark:text-gray-400">{bestOdds['X'].operator?.name || 'N/A'}</span>
      </div>
      <div className="flex flex-col items-center py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Away (2)</span>
        <a
          href={bestOdds['2'].operator?.affiliate_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-base text-indigo-600 dark:text-indigo-400 hover:underline"
          aria-label={`Go to ${bestOdds['2'].operator?.name || 'bookmaker'} for best away odds`}
        >
          {bestOdds['2'].odds > 0 ? bestOdds['2'].odds.toFixed(2) : '-'}
        </a>
        <span className="text-xs text-gray-500 dark:text-gray-400">{bestOdds['2'].operator?.name || 'N/A'}</span>
      </div>
    </div>
  );
}

// Full odds table component
function OddsTable({ odds, homeTeamName, awayTeamName }: { odds: any[], homeTeamName: string, awayTeamName: string }) {
  
  const [sortColumn, setSortColumn] = useState('operator');
  const [sortDirection, setSortDirection] = useState('asc');
  const [allBookmakers, setAllBookmakers] = useState<any[]>([]);

  // Fetch all bookmakers when component mounts
  useEffect(() => {
    const fetchBookmakers = async () => {
      try {
        const response = await fetch('/api/bookmakers');
        if (!response.ok) {
          throw new Error('Failed to fetch bookmakers');
        }
        const data = await response.json();
        setAllBookmakers(data.bookmakers);
      } catch (error) {
        console.error('Error fetching bookmakers:', error);
      }
    };
    fetchBookmakers();
  }, []);

  const findBestOdds = (oddsArray: any[]) => {
    const bestOdds = {
      '1': { odds: 0, operator: null as any },
      'X': { odds: 0, operator: null as any },
      '2': { odds: 0, operator: null as any }
    };

    if (!oddsArray) return bestOdds;

    oddsArray.forEach(oddSet => {
      if (oddSet.Operators) {
        // Check home win odds
        if (oddSet.home_win && parseFloat(oddSet.home_win) > bestOdds['1'].odds) {
          bestOdds['1'] = { odds: parseFloat(oddSet.home_win), operator: oddSet.Operators };
        }
        // Check draw odds
        if (oddSet.draw && parseFloat(oddSet.draw) > bestOdds['X'].odds) {
          bestOdds['X'] = { odds: parseFloat(oddSet.draw), operator: oddSet.Operators };
        }
        // Check away win odds
        if (oddSet.away_win && parseFloat(oddSet.away_win) > bestOdds['2'].odds) {
          bestOdds['2'] = { odds: parseFloat(oddSet.away_win), operator: oddSet.Operators };
        }
      }
    });

    return bestOdds;
  };

  const bestOdds = findBestOdds(odds);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'operator' ? 'asc' : 'desc');
    }
  };

  // Create a map of odds by bookmaker ID for quick lookup
  const oddsByBookmaker = new Map();
  odds.forEach(oddSet => {
    if (oddSet.Operators) {
      oddsByBookmaker.set(oddSet.Operators.id, oddSet);
    }
  });

  // Filter bookmakers to only show those that have odds for this match
  const bookmakersWithOdds = allBookmakers.filter(bookmaker => {
    const oddSet = oddsByBookmaker.get(bookmaker.id);
    return oddSet && (oddSet.home_win !== null || oddSet.draw !== null || oddSet.away_win !== null);
  });

  // Sort bookmakers with odds
  const sortedBookmakers = [...bookmakersWithOdds].sort((a, b) => {
    const oddSetA = oddsByBookmaker.get(a.id);
    const oddSetB = oddsByBookmaker.get(b.id);
    
    if (sortColumn === 'operator') {
      return sortDirection === 'asc' 
        ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
    } else if (sortColumn === '1') {
      const valueA = oddSetA?.home_win ? parseFloat(oddSetA.home_win) : 0;
      const valueB = oddSetB?.home_win ? parseFloat(oddSetB.home_win) : 0;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    } else if (sortColumn === 'X') {
      const valueA = oddSetA?.draw ? parseFloat(oddSetA.draw) : 0;
      const valueB = oddSetB?.draw ? parseFloat(oddSetB.draw) : 0;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    } else if (sortColumn === '2') {
      const valueA = oddSetA?.away_win ? parseFloat(oddSetA.away_win) : 0;
      const valueB = oddSetB?.away_win ? parseFloat(oddSetB.away_win) : 0;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });

  return (
    <div className="overflow-x-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <table className="odds-table w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <th
              className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors duration-200 rounded-tl-lg"
              onClick={() => handleSort('operator')}
              tabIndex={0}
              role="button"
              aria-label="Sort by operator"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSort('operator'); }}
            >
              <div className="flex items-center">
                <span>Operator</span>
                <span className="sort-arrow ml-2 text-xs">
                  {sortColumn === 'operator' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </div>
            </th>
            <th
              className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors duration-200"
              onClick={() => handleSort('1')}
              tabIndex={0}
              role="button"
              aria-label={`Sort by odds for ${homeTeamName} win`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSort('1'); }}
            >
              <div className="flex items-center justify-center">
                <span>{homeTeamName} (1)</span>
                <span className="sort-arrow ml-2 text-xs">
                  {sortColumn === '1' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </div>
            </th>
            <th
              className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors duration-200"
              onClick={() => handleSort('X')}
              tabIndex={0}
              role="button"
              aria-label="Sort by odds for draw"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSort('X'); }}
            >
              <div className="flex items-center justify-center">
                <span>Draw (X)</span>
                <span className="sort-arrow ml-2 text-xs">
                  {sortColumn === 'X' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </div>
            </th>
            <th
              className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors duration-200 rounded-tr-lg"
              onClick={() => handleSort('2')}
              tabIndex={0}
              role="button"
              aria-label={`Sort by odds for ${awayTeamName} win`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSort('2'); }}
            >
              <div className="flex items-center justify-center">
                <span>{awayTeamName} (2)</span>
                <span className="sort-arrow ml-2 text-xs">
                  {sortColumn === '2' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedBookmakers.map((bookmaker, index) => {
            const oddSet = oddsByBookmaker.get(bookmaker.id);
            const operatorName = bookmaker.name;
            const affiliateUrl = bookmaker.url || '#';
            // Test highlighting - temporarily highlight first row to verify CSS works
            const testHighlight = index === 0 ? 'highlight-best-odd' : '';
            const homeHighlight = oddSet && oddSet.home_win && Math.abs(parseFloat(oddSet.home_win) - bestOdds['1'].odds) < 0.001 ? 'highlight-best-odd' : '';
            const drawHighlight = oddSet && oddSet.draw && Math.abs(parseFloat(oddSet.draw) - bestOdds['X'].odds) < 0.001 ? 'highlight-best-odd' : '';
            const awayHighlight = oddSet && oddSet.away_win && Math.abs(parseFloat(oddSet.away_win) - bestOdds['2'].odds) < 0.001 ? 'highlight-best-odd' : '';

            return (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <BookmakerLogo
                      logoUrl={bookmaker.image_path}
                      bookmakerName={operatorName}
                      size="md"
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {operatorName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-700">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`odds-cell transition-all duration-200 hover:scale-105 hover:shadow-md ${testHighlight} ${homeHighlight}`}
                    aria-label={`Go to ${operatorName} for odds on ${homeTeamName} win`}
                  >
                    {oddSet?.home_win ? parseFloat(oddSet.home_win).toFixed(2) : '-'}
                  </a>
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-700">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`odds-cell transition-all duration-200 hover:scale-105 hover:shadow-md ${drawHighlight}`}
                    aria-label={`Go to ${operatorName} for odds on draw`}
                  >
                    {oddSet?.draw ? parseFloat(oddSet.draw).toFixed(2) : '-'}
                  </a>
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-700">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`odds-cell transition-all duration-200 hover:scale-105 hover:shadow-md ${awayHighlight}`}
                    aria-label={`Go to ${operatorName} for odds on ${awayTeamName} win`}
                  >
                    {oddSet?.away_win ? parseFloat(oddSet.away_win).toFixed(2) : '-'}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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

export default function MatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllOdds, setShowAllOdds] = useState(false);

  const fullMatchId = params.matchId as string;
  const timezone = searchParams.get('timezone') || 'auto';
  
  // Extract the numeric match ID from the URL slug (e.g., "19347815-aik-vs-ster" -> "19347815")
  const matchId = fullMatchId ? fullMatchId.split('-')[0] : null;

  useEffect(() => {
    const fetchMatch = async () => {
      console.log('🔍 Fetching match with ID:', matchId, 'from full slug:', fullMatchId);
      
      if (!matchId) {
        setError('No match ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/match/${matchId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }
        const data = await response.json();
        console.log('🔍 Match data received:', data.match);
        setMatch(data.match);
      } catch (err: any) {
        console.error('🔍 Error fetching match:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, fullMatchId]);

  const getTargetTimezone = () => {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  };

  const getMatchStatus = () => {
    if (match?.status === 'Live') return { text: 'LIVE', color: 'bg-red-500' };
    if (match?.status === 'Finished') return { text: 'FULL TIME', color: 'bg-gray-500' };
    if (match?.status === 'Scheduled') return { text: 'UPCOMING', color: 'bg-blue-500' };
    return { text: match?.status || 'Unknown', color: 'bg-gray-400' };
  };

  if (loading) {
    return (
      <MatchSkeleton />
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <div className="text-center py-10 text-red-500 dark:text-red-400">
            <p>Could not load match details: {error}</p>
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block" aria-label="Return to homepage">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getMatchStatus();
  const homeTeamName = match.home_team?.name || 'Unknown Home Team';
  const awayTeamName = match.away_team?.name || 'Unknown Away Team';
  const hasOdds = match.Odds && match.Odds.length > 0;
  const hasBroadcasters = match.Event_Broadcasters && match.Event_Broadcasters.length > 0;

  // Generate SEO content
  const timeOptions: Intl.DateTimeFormatOptions = { timeZone: getTargetTimezone(), weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const fullDate = new Date(match.start_time).toLocaleDateString('en-GB', timeOptions);
  const kickoffTime = new Date(match.start_time).toLocaleTimeString('en-GB', { timeZone: getTargetTimezone(), hour: '2-digit', minute: '2-digit' });

  let statusText = '';
  if (match.status === 'Finished') {
    statusText = `This ${match.Competitions?.name || 'football'} match has concluded with a final score of ${match.home_score || 0}-${match.away_score || 0}.`;
  } else if (match.status === 'Live') {
    statusText = `The game is currently LIVE! The current score is ${match.home_score || 0}-${match.away_score || 0}.`;
  } else {
    const broadcasters = match.Event_Broadcasters?.map((b: any) => b.Broadcasters?.name).filter(Boolean).join(', ') || 'N/A';
    statusText = `Watch the match via ${broadcasters}.`;
  }

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
                      <span className="font-bold text-sm md:text-2xl text-gray-900 dark:text-white text-center break-words leading-tight transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-lg">
                        {homeTeamName}
                      </span>
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
                          {new Date(match.start_time).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(match.start_time).toLocaleDateString('en-GB', {
                            month: 'short',
                            day: 'numeric'
                          })}
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
                      <span className="font-bold text-sm md:text-2xl text-gray-900 dark:text-white text-center break-words leading-tight transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-lg">
                        {awayTeamName}
                      </span>
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
              <div className="text-center mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Broadcasters:</p>
                {hasBroadcasters ? (
                  <>
                    {/* Desktop Layout - Horizontal with logos */}
                    <div className="hidden md:flex flex-wrap justify-center gap-4 mb-4">
                      {match.Event_Broadcasters.map((eb: any, index: number) => {
                        const broadcaster = eb.Broadcasters;
                        if (!broadcaster?.name) return null;
                        
                        return (
                          <BroadcasterLogo
                            key={index}
                            logoUrl={broadcaster.logo_url}
                            broadcasterName={broadcaster.name}
                            affiliateUrl={broadcaster.affiliate_url}
                            size="md"
                          />
                        );
                      })}
                    </div>
                    
                    {/* Mobile Layout - Bullet points with logos and names */}
                    <div className="md:hidden">
                      <ul className="list-none space-y-0 text-left max-w-sm mx-auto">
                        {match.Event_Broadcasters.map((eb: any, index: number) => {
                          const broadcaster = eb.Broadcasters;
                          if (!broadcaster?.name) return null;
                          
                          return (
                            <li key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                              <div className="flex-shrink-0">
                                {broadcaster.affiliate_url ? (
                                  <a
                                    href={broadcaster.affiliate_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:scale-105 transition-transform duration-200"
                                    aria-label={`Watch on ${broadcaster.name}`}
                                  >
                                    <div className="w-8 h-8 flex items-center justify-center">
                                      {broadcaster.logo_url ? (
                                        <Image
                                          src={broadcaster.logo_url}
                                          alt={`${broadcaster.name} logo`}
                                          width={32}
                                          height={32}
                                          className="object-contain rounded bg-white border border-gray-200 dark:border-gray-700"
                                          onError={(e) => {
                                            // Fallback to letter if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                              parent.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                                  ${broadcaster.name.charAt(0).toUpperCase()}
                                                </div>
                                              `;
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                          {broadcaster.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                  </a>
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    {broadcaster.logo_url ? (
                                      <Image
                                        src={broadcaster.logo_url}
                                        alt={`${broadcaster.name} logo`}
                                        width={32}
                                        height={32}
                                        className="object-contain rounded bg-white border border-gray-200 dark:border-gray-700"
                                        onError={(e) => {
                                          // Fallback to letter if image fails to load
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent) {
                                            parent.innerHTML = `
                                              <div class="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                                ${broadcaster.name.charAt(0).toUpperCase()}
                                              </div>
                                            `;
                                          }
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                        {broadcaster.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {broadcaster.name}
                                </span>
                                {broadcaster.affiliate_url && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Click to visit broadcaster
                                  </div>
                                )}
                              </div>
                              {broadcaster.affiliate_url && (
                                <div className="flex-shrink-0">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">N/A</p>
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

              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <BestOddsSummary odds={match.Odds} />
                
                <button
                  className="w-full flex justify-between items-center py-2 px-3 border-t border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setShowAllOdds(!showAllOdds)}
                  aria-label={showAllOdds ? 'Hide all odds table' : 'Show all odds table'}
                >
                  <span className="font-semibold text-base">
                    {showAllOdds ? 'Hide All Odds' : 'View All Odds'}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 transform ${showAllOdds ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showAllOdds && (
                <div className="mt-4">
                  <OddsTable odds={match.Odds} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
                </div>
              )}
            </div>
          )}

          {/* No Odds Message */}
          {(!hasOdds || match.status === 'Finished') && (
            <div className="mt-8 text-center py-5 text-gray-500 dark:text-gray-400">
              No 1X2 odds available for this match.
            </div>
          )}

          {/* General Info Section */}
          <section className="bg-gray-100 dark:bg-gray-800 py-6 mt-8">
            <div className="text-left">
              <p className="text-left text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                Sports TV Guide is your ultimate resource for comprehensive live football on TV schedules, 
                detailed match information, and competitive betting odds comparisons for all major football 
                leagues and competitions worldwide. Whether you're looking for today's football matches or 
                future fixtures, we've got you covered.
              </p>
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