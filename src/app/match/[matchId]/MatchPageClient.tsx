"use client";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamForm, transformOddsByBookmaker } from '@/lib/database-adapter';
import TeamLogo from '@/components/TeamLogo';
import BroadcasterLogo from '@/components/BroadcasterLogo';
import BookmakerLogo from '@/components/BookmakerLogo';
import TeamFormRectangles from '@/components/TeamFormRectangles';
import BroadcasterRow from '@/components/BroadcasterRow';
import BroadcasterFilters from '@/components/BroadcasterFilters';
import ResponsiveBroadcasterSection from '@/components/ResponsiveBroadcasterSection';
import CompactBroadcasterSection from '@/components/CompactBroadcasterSection';
import MatchOddsDisplay from '@/components/MatchOddsDisplay';
import MatchCardDisplay from '@/components/MatchCardDisplay';
import BackToTopButton from '@/components/BackToTopButton';
import Breadcrumb from '@/components/Breadcrumb';
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clickCounts, setClickCounts] = useState<{ [key: number]: number }>({});
  const [filters, setFilters] = useState({ 
    geoLocation: 'all', 
    subscriptionType: [] as string[], 
    selectedCountry: null as { id: number; name: string; image_path?: string } | null 
  });

  const timezone = searchParams.get('timezone') || 'auto';

  // Initialize click tracking and fetch click counts
  useEffect(() => {
    // Initialize the tracking system
    initializeClickTracking();
    
    // Fetch current click counts
    const fetchClickCounts = async () => {
      try {
        const response = await fetch(`/api/broadcaster-clicks?matchId=${match.id}`);
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
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching click counts:', error);
        }
      }
    };
    
    fetchClickCounts();
    
    // Add skeleton click counts for testing
    const skeletonClickCounts: { [key: number]: number } = {
      1: 2340, // ESPN+ - most popular
      2: 1890, // Sky Sports
      3: 1560, // DAZN
      4: 1230, // Viaplay
      5: 980,  // beIN Sports
      6: 2100, // YouTube (Free) - second most popular
      7: 750,  // BT Sport
      8: 890   // Amazon Prime Video
    };
    
    // Use skeleton data if no real data available
    setTimeout(() => {
      setClickCounts(prev => Object.keys(prev).length > 0 ? prev : skeletonClickCounts);
    }, 1000);
  }, []);
  
  const getTargetTimezone = () => {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  };

  const handleLeagueClick = () => {
    if (match.Competitions?.id && match.Competitions?.name) {
      const leagueSlug = match.Competitions.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const leagueUrl = `/competition/${match.Competitions.id}-${leagueSlug}`;
      console.log('🏆 Navigating to league:', leagueUrl);
      router.push(leagueUrl);
    }
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
    const targetTz = getTargetTimezone();
    
    if (targetTz === 'auto' || targetTz === Intl.DateTimeFormat().resolvedOptions().timeZone) {
      // Use local time for auto timezone or when target matches local
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // For specific timezone, convert to target timezone
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: targetTz,
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
  };

  // Countdown timer for matches starting within 2 hours
  const [countdown, setCountdown] = useState<string>('');
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  useEffect(() => {
    const matchTime = new Date(match.start_time);
    const now = new Date();
    const timeDiff = matchTime.getTime() - now.getTime();
    
    // Show countdown if match is within 2 hours and hasn't started yet
    const shouldShowCountdown = timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000 && match.status !== 'Live' && match.status !== 'Finished';
    setShowCountdown(shouldShowCountdown);

    if (shouldShowCountdown) {
      const updateCountdown = () => {
        const now = new Date();
        const timeDiff = matchTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
          setCountdown('Starting now!');
          // Keep showing countdown for a few seconds, then switch to normal time
          setTimeout(() => {
            setShowCountdown(false);
          }, 3000); // Show "Starting now!" for 3 seconds
          return;
        }
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setCountdown(`${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${seconds}s`);
        }
      };
      
      updateCountdown(); // Initial call
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }
  }, [match.start_time, match.status]);

  // Custom short date formatter (Today, Tomorrow, or dd/mm)
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time to compare only dates
    const matchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    if (matchDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (matchDate.getTime() === tomorrowDate.getTime()) {
      return 'Tomorrow';
    } else {
      // Format as dd/mm
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    }
  };

  // Calculate match minute for live games
  const getMatchMinute = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    // Add 1 minute to account for match start
    const matchMinute = Math.max(1, diffInMinutes + 1);
    
    // Cap at 90 minutes for regular time
    return Math.min(90, matchMinute);
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

  // Skeleton data for testing when no real broadcasters are available
  const skeletonBroadcasters = [
    {
      id: 1,
      name: "ESPN+",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/1/1.png",
      affiliate_url: "https://www.plus.espn.com",
    },
    {
      id: 2,
      name: "Sky Sports",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/2/2.png",
      affiliate_url: "https://www.skysports.com",
    },
    {
      id: 3,
      name: "DAZN",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/3/3.png",
      affiliate_url: "https://www.dazn.com",
    },
    {
      id: 4,
      name: "Viaplay",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/4/4.png",
      affiliate_url: "https://www.viaplay.com",
    },
    {
      id: 5,
      name: "beIN Sports",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/5/5.png",
      affiliate_url: "https://www.beinsports.com",
    },
    {
      id: 6,
      name: "YouTube (Free)",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/6/6.png",
      affiliate_url: "https://www.youtube.com",
    },
    {
      id: 7,
      name: "BT Sport",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/7/7.png",
      affiliate_url: "https://www.bt.com/sport",
    },
    {
      id: 8,
      name: "Amazon Prime Video",
      logo_url: "https://cdn.sportmonks.com/images/soccer/leagues/8/8.png",
      affiliate_url: "https://www.primevideo.com",
    }
  ];

  // Use skeleton data if no real broadcasters available
  const displayBroadcasters = validBroadcasters.length > 0 ? validBroadcasters : skeletonBroadcasters;

  // Filter broadcasters based on selected filters
  const filteredBroadcasters = displayBroadcasters.filter((broadcaster: any) => {
    // For now, we'll use basic filtering based on broadcaster names
    // This can be enhanced when you have more detailed data
    
    // Subscription type filtering (multi-select)
    if (filters.subscriptionType.length > 0) {
      const isFree = broadcaster.name.toLowerCase().includes('free') || 
                   broadcaster.name.toLowerCase().includes('youtube');
      
      const hasFree = filters.subscriptionType.includes('free');
      const hasSubscription = filters.subscriptionType.includes('subscription');
      const hasTrial = filters.subscriptionType.includes('trial');
      
      // If filtering for free and this is not free, exclude it
      if (hasFree && !isFree) return false;
      
      // If filtering for subscription and this is free, exclude it
      if (hasSubscription && isFree) return false;
      
      // For trial filtering, you can enhance this logic when you have trial data
      if (hasTrial && !isFree) return false; // Placeholder logic
    }
    
    // Geo location filtering (basic implementation)
    if (filters.geoLocation !== 'all') {
      // This is a placeholder - you can enhance this with actual geo data
      // For now, we'll show all broadcasters regardless of geo filter
      // You can add geo-specific logic here when you have that data
    }
    
    // Country filtering
    if (filters.selectedCountry) {
      // Filter by country if one is selected
      // This will work when the broadcaster data includes country_id
      if (broadcaster.country_id && broadcaster.country_id !== filters.selectedCountry.id) {
        return false;
      }
    }
    
    return true;
  });

  // Sort broadcasters by click count (highest first)
  const sortedBroadcasters = [...filteredBroadcasters].sort((a: any, b: any) => {
    const aClicks = clickCounts[a.id] || 0;
    const bClicks = clickCounts[b.id] || 0;
    return bClicks - aClicks; // Descending order (highest first)
  });

  // Find the broadcaster with the highest total clicks for the "Most Popular" badge
  const mostPopularBroadcaster = sortedBroadcasters.length > 0 && (clickCounts[sortedBroadcasters[0].id] || 0) > 0 
    ? sortedBroadcasters[0] 
    : null;


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        {/* Main Content */}
        <main>
          {/* Match Header */}
          <div className="rounded-lg shadow-sm overflow-hidden mb-2 w-full">
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 mt-4">
              <Breadcrumb 
                items={[
                  { label: 'Home', href: '/' },
                  { 
                    label: match.Competitions?.name || 'League', 
                    href: `/competition/${match.Competitions?.id}-${match.Competitions?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}` 
                  },
                  { 
                    label: `${homeTeamName} vs ${awayTeamName}`, 
                    isActive: true 
                  }
                ]} 
              />
            </div>
            <div className="p-6">
              {/* Match Card Display */}
              <div className="flex flex-col items-center justify-center mb-6">
                <MatchCardDisplay 
                  match={match} 
                  timezone={timezone}
                />
              </div>

              {/* Broadcasters - Row Layout */}
              <div className="mb-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Where to Watch ({sortedBroadcasters.length})
                </h3>
                  
                  {/* Filters */}
                  <BroadcasterFilters onFiltersChange={setFilters} />
                </div>
                <CompactBroadcasterSection
                  broadcasters={sortedBroadcasters}
                  clickCounts={clickCounts}
                  mostPopularBroadcaster={mostPopularBroadcaster}
                  onBroadcasterClick={trackBroadcasterClick}
                  matchId={match.id}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <section className="py-4 mt-2">
            <div className="px-6">
              {/* Match Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {homeTeamName} vs {awayTeamName} - <button 
                    onClick={handleLeagueClick}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors duration-200 cursor-pointer"
                    title={`View ${match.Competitions?.name || 'League'} page`}
                  >
                    {match.Competitions?.name || 'Match'}
                  </button>
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

      {/* Back to Top Button - Floating */}
      <BackToTopButton />

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