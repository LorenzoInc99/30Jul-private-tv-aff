"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatchCard from '../components/MatchCard';
import LeagueLogo from '../components/LeagueLogo';
import { getPinnedLeagues, togglePinnedLeague, isLeaguePinned } from '../lib/pinned-leagues';
import { slugify } from '../lib/utils';
import { LeagueScheduleSkeleton } from '../components/SkeletonLoader';
import { NoMatchesEmptyState } from '../components/EmptyStates';
import { trackLeagueInteraction, getPersonalizedLeagueOrder } from '../lib/league-tracking';

export default function LeagueSchedule({ 
  competitions, 
  timezone = 'auto', 
  showOdds = true, 
  showTv = true,
  starredMatches = new Set<string>(),
  onStarToggle
}: { 
  competitions: any[]; 
  timezone?: string; 
  showOdds?: boolean; 
  showTv?: boolean;
  starredMatches?: Set<string>;
  onStarToggle?: (matchId: string) => void;
}) {
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  // Removed expanded state - always show all matches
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [personalizedOrder, setPersonalizedOrder] = useState<{ leagueId: number; priority: number }[]>([]);
  const router = useRouter();

  // Load pinned leagues and personalized order on mount
  useEffect(() => {
    setMounted(true);
    updatePinnedLeagues();
    loadPersonalizedOrder();
  }, [competitions]);

  const loadPersonalizedOrder = async () => {
    try {
      const order = await getPersonalizedLeagueOrder();
      setPersonalizedOrder(order);
    } catch (error) {
      console.error('Failed to load personalized order:', error);
    }
  };

  const updatePinnedLeagues = () => {
    const pinned = getPinnedLeagues();
    setPinnedLeagues(pinned);
  };

  const handlePinToggle = (league: any) => {
    togglePinnedLeague(league);
    updatePinnedLeagues();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('pinnedLeaguesChanged'));
  };

  const handleLeagueClick = async (league: any) => {
    // Track league interaction
    await trackLeagueInteraction(league.competition.id, 'league_view');
    
    // Navigate to league page
    const leagueSlug = slugify(league.competition.name);
    router.push(`/competition/${league.competition.id}-${leagueSlug}`);
  };

  // Removed useEffect for expanding leagues - always show all matches

  // Sort: pinned leagues first, then personalized order, then alphabetical
  const sorted = [...competitions].sort((a, b) => {
    const aPinned = isLeaguePinned(a.competition.id);
    const bPinned = isLeaguePinned(b.competition.id);
    
    // Pinned leagues always first
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    // If both pinned or both not pinned, use personalized order
    if (aPinned === bPinned) {
      const aPersonal = personalizedOrder.find(p => p.leagueId === a.competition.id);
      const bPersonal = personalizedOrder.find(p => p.leagueId === b.competition.id);
      
      if (aPersonal && bPersonal) {
        return aPersonal.priority - bPersonal.priority;
      }
      if (aPersonal && !bPersonal) return -1;
      if (!aPersonal && bPersonal) return 1;
    }
    
    // Fallback to alphabetical
    return a.competition.name.localeCompare(b.competition.name);
  });

  // Helper to get the correct timezone string
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  // Debug: Log the competition data structure
  console.log('LeagueSchedule competitions data:', sorted.map(g => ({
    id: g.competition.id,
    name: g.competition.name,
    league_logo: g.competition.league_logo,
    country: g.competition.country
  })));


  // Show empty state if no competitions with matches
  const hasMatches = sorted.some(group => group.matches && group.matches.length > 0);
  if (!hasMatches) {
    return <NoMatchesEmptyState />;
  }

  return (
    <div className="space-y-1">
      {sorted.map(group => {
        const isPinned = mounted && isLeaguePinned(group.competition.id);
        return (
          <div key={group.competition.id} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-3 md:rounded-lg md:shadow">
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <svg
                  className={`pin-star w-5 h-5 ${isPinned ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'}`}
                  fill={isPinned ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  onClick={e => { 
                    e.stopPropagation(); 
                    handlePinToggle(group.competition);
                  }}
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" 
                  />
                </svg>
                <div className="flex items-center gap-2">
                  {group.competition.league_logo && (
                    <LeagueLogo 
                      logoUrl={group.competition.league_logo} 
                      leagueName={group.competition.name} 
                      leagueId={group.competition.id}
                      size="md" 
                      className="flex-shrink-0"
                    />
                  )}
                  <div className="flex flex-col">
                    <Link 
                      href={`/competition/${group.competition.id}-${slugify(group.competition.name)}`}
                      className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={async (e) => {
                        console.log('🏆 League name clicked:', group.competition.name);
                        console.log('🏆 League ID:', group.competition.id);
                        e.stopPropagation();
                        await trackLeagueInteraction(group.competition.id, 'league_view');
                      }}
                    >
                      {group.competition.name}
                      <span className="text-sm font-normal ml-1">({group.matches.length})</span>
                    </Link>
                    {group.competition.country && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {group.competition.country.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={`collapse-transition expanded`} style={{ opacity: 1 }}>
                {group.matches.map((match: any, idx: number) => {
                  const homeSlug = slugify(match.home_team?.name || 'home');
                  const awaySlug = slugify(match.away_team?.name || 'away');
                  const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                  console.log('Generated match URL:', matchUrl, 'for match:', match.id);
                  const isExpanded = expandedMatch === match.id;
                  const isStarred = starredMatches.has(match.id);
                  
                  return (
                    <div 
                      key={match.id} 
                      className={`overflow-x-auto w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${idx === 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}
                      onClick={async (e) => {
                        console.log('🔥 MATCH ROW CLICKED:', match.id);
                        console.log('🔥 Teams:', match.home_team?.name, 'vs', match.away_team?.name);
                        
                        // Prevent event bubbling to avoid conflicts
                        e.stopPropagation();
                        
                        try {
                          // Track match click for league interaction
                          await trackLeagueInteraction(group.competition.id, 'match_click');
                          const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                          console.log('🔥 Navigating to:', matchUrl);
                          router.push(matchUrl);
                        } catch (error) {
                          console.error('🔥 Error navigating to match:', error);
                        }
                      }}
                    >
                      <MatchCard
                        match={match}
                        timezone={timezone}
                        isExpanded={isExpanded}
                        showOdds={showOdds}
                        showTv={showTv}
                        isStarred={isStarred}
                        onStarToggle={onStarToggle ? () => onStarToggle(match.id) : undefined}
                        onExpandToggle={e => {
                          e.stopPropagation();
                          setExpandedMatch(isExpanded ? null : match.id);
                        }}
                        onClick={() => {}} // Disable MatchCard's own click handler
                        homePageFormat={true}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
} 