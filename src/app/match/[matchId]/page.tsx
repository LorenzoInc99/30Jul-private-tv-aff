"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMatchById, getTeamForm } from '@/lib/database-adapter';







// Team form rectangles component
function TeamFormRectangles({ teamId, matchStartTime }: { teamId: number, matchStartTime: string }) {
  const [formResults, setFormResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTeamForm = async () => {
      try {
        console.log('Fetching team form for teamId:', teamId, 'before date:', matchStartTime, 'type:', typeof matchStartTime);
        const formData = await getTeamForm(teamId, matchStartTime);
        console.log('Team form data received:', formData);
        setFormResults(formData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team form:', error);
        setFormResults([]);
        setLoading(false);
      }
    };

    fetchTeamForm();
  }, [teamId, matchStartTime]);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 100); // 0.1 seconds
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  const handleClick = (form: any) => {
    if (form?.matchUrl) {
      console.log('Navigating to:', form.matchUrl);
      router.push(form.matchUrl);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-2 space-x-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="w-5 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Show 5 rectangles (filled or grey) - most recent on the right
  console.log('Form results length:', formResults.length);
  console.log('Form results:', formResults);
  
  const displayResults = Array(5).fill(null).map((_, index) => {
    // Reverse the order so most recent is on the right
    const reversedIndex = 4 - index;
    const result = formResults[reversedIndex] || null;
    console.log(`Rectangle ${index} (reversedIndex ${reversedIndex}):`, result);
    return result;
  });

  return (
    <div className="flex justify-center mt-2 space-x-1 relative">
      {displayResults.map((form, index) => {
        let bgColor = 'bg-gray-400 dark:bg-gray-500'; // Default grey for no data
        
        if (form?.result) {
          if (form.result === 'win') {
            bgColor = 'bg-green-500 dark:bg-green-600';
          } else if (form.result === 'draw') {
            bgColor = 'bg-orange-500 dark:bg-orange-600';
          } else if (form.result === 'loss') {
            bgColor = 'bg-red-500 dark:bg-red-600';
          }
        }

        return (
          <div
            key={index}
            className={`w-5 h-4 ${bgColor} rounded-sm transition-colors duration-200 cursor-pointer relative ${
              form?.matchUrl ? 'hover:scale-110' : ''
            }`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(form)}
          >
            {/* Custom tooltip */}
            {hoveredIndex === index && showTooltip && form && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                vs {form.opponent}
                {form.matchUrl && (
                  <div className="text-blue-300 text-xs mt-1">Click to view match</div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'operator' ? 'asc' : 'desc');
    }
  };

  const sortedOdds = [...odds].sort((a, b) => {
    let valA, valB;
    if (sortColumn === 'operator') {
      valA = a.Operators.name.toLowerCase();
      valB = b.Operators.name.toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      if (sortColumn === '1') {
        valA = parseFloat(a.home_win) || 0;
        valB = parseFloat(b.home_win) || 0;
      } else if (sortColumn === 'X') {
        valA = parseFloat(a.draw) || 0;
        valB = parseFloat(b.draw) || 0;
      } else {
        valA = parseFloat(a.away_win) || 0;
        valB = parseFloat(b.away_win) || 0;
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
  });

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <table className="odds-table w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('operator')}
            >
              Operator
              <span className="sort-arrow ml-1">
                {sortColumn === 'operator' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('1')}
            >
              {homeTeamName} (1)
              <span className="sort-arrow ml-1">
                {sortColumn === '1' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('X')}
            >
              Draw (X)
              <span className="sort-arrow ml-1">
                {sortColumn === 'X' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('2')}
            >
              {awayTeamName} (2)
              <span className="sort-arrow ml-1">
                {sortColumn === '2' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedOdds.map((oddSet, index) => {
            const operatorName = oddSet.Operators.name;
            const affiliateUrl = oddSet.Operators.affiliate_url || '#';
            const homeHighlight = parseFloat(oddSet.home_win) === bestOdds['1'].odds ? 'highlight-best-odd' : '';
            const drawHighlight = parseFloat(oddSet.draw) === bestOdds['X'].odds ? 'highlight-best-odd' : '';
            const awayHighlight = parseFloat(oddSet.away_win) === bestOdds['2'].odds ? 'highlight-best-odd' : '';

            return (
              <tr key={index}>
                <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {operatorName}
                </td>
                <td className="px-3 py-2 text-center">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`odds-cell transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${homeHighlight}`}
                  >
                    {oddSet.home_win ? parseFloat(oddSet.home_win).toFixed(2) : '-'}
                  </a>
                </td>
                <td className="px-3 py-2 text-center">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`odds-cell transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${drawHighlight}`}
                  >
                    {oddSet.draw ? parseFloat(oddSet.draw).toFixed(2) : '-'}
                  </a>
                </td>
                <td className="px-3 py-2 text-center">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`odds-cell transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${awayHighlight}`}
                  >
                    {oddSet.away_win ? parseFloat(oddSet.away_win).toFixed(2) : '-'}
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
        const matchData = await getMatchById(matchId);
        console.log('🔍 Match data received:', matchData);
        setMatch(matchData);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Loading match details...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <div className="text-center py-10 text-red-500 dark:text-red-400">
            <p>Could not load match details: {error}</p>
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block">
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
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <Link href="/" className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight no-underline hover:text-indigo-600 dark:hover:text-indigo-400">
            Live Football on TV
          </Link>
        </header>

        {/* Main Content */}
        <main className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Match Header */}
          <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-2 w-full">
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

              {/* Teams and Score */}
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-6">
                <div className="flex flex-col items-center">
                  <Image
                    src={match.home_team?.logo_url || 'https://placehold.co/64x64/f3f4f6/f3f4f6'}
                    alt={homeTeamName}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain mb-2"
                  />
                  <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white">{homeTeamName}</span>
                  <TeamFormRectangles
                    teamId={match.home_team_id}
                    matchStartTime={match.start_time}
                  />
                </div>
                <span className="text-3xl font-extrabold text-gray-500 dark:text-gray-400">vs</span>
                <div className="flex flex-col items-center">
                  <Image
                    src={match.away_team?.logo_url || 'https://placehold.co/64x64/f3f4f6/f3f4f6'}
                    alt={awayTeamName}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain mb-2"
                  />
                  <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white">{awayTeamName}</span>
                  <TeamFormRectangles
                    teamId={match.away_team_id}
                    matchStartTime={match.start_time}
                  />
                </div>
              </div>

              {/* Match Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Kick-off Time:</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{fullDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Status:</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{match.status}</p>
                </div>
              </div>

              {/* Live Score */}
              {(match.status === 'Live' || match.status === 'Finished') && (
                <div className="text-center mb-6">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Current Score:</p>
                  <p className="font-bold text-gray-900 dark:text-white text-4xl">
                    {match.home_score || 0} - {match.away_score || 0}
                  </p>
                </div>
              )}

              {/* Broadcasters */}
              <div className="text-center mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Broadcasters:</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  {hasBroadcasters 
                    ? match.Event_Broadcasters.map((b: any) => b.Broadcasters?.name).filter(Boolean).join(', ')
                    : 'N/A'
                  }
                </p>
              </div>

              {/* Key Information Summary */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Where to watch {homeTeamName} vs {awayTeamName}:</strong> {statusText}
                  Are you looking for the best odds and where to watch this anticipated {match.Competitions?.name || 'football'} match between {homeTeamName} and {awayTeamName}? We got you covered.
                </p>
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
                >
                  <span className="font-semibold text-base">
                    {showAllOdds ? 'Hide All Odds' : 'View All Odds'}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 transform ${showAllOdds ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
          padding-left: 0.75rem;
        }
        .odds-table td:first-child {
          text-align: left;
        }
        .odds-table th:last-child, .odds-table td:last-child {
          padding-right: 0.75rem;
        }
        .odds-cell {
          display: block;
          padding: 0.5rem 0.75rem;
          border-radius: 0.25rem;
          text-align: center;
        }
        .highlight-best-odd {
          background-color: #dcfce7;
          color: #166534;
          font-weight: bold;
        }
        .dark .highlight-best-odd {
          background-color: #14532d;
          color: #dcfce7;
        }
        .sort-arrow {
          display: inline-block;
          margin-left: 0.25rem;
          font-size: 0.75em;
          vertical-align: middle;
        }

      `}</style>
    </div>
  );
} 