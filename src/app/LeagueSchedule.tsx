"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatchCard from '../components/MatchCard';
import CountryFlag from '../components/CountryFlag';
import { getPinnedLeagues, togglePinnedLeague, isLeaguePinned } from '../lib/pinned-leagues';
import { slugify } from '../lib/utils';

export default function LeagueSchedule({ competitions, timezone = 'auto', showOdds = true }: { competitions: any[]; timezone?: string; showOdds?: boolean }) {
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Load pinned leagues on mount
  useEffect(() => {
    setMounted(true);
    updatePinnedLeagues();
  }, [competitions]);

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

  useEffect(() => {
    // Expand all by default on mount
    const all: { [id: number]: boolean } = {};
    competitions.forEach(c => { all[c.competition.id] = true; });
    setExpanded(all);
  }, [competitions]);

  // Sort: pinned leagues first, then alphabetical
  const sorted = [...competitions].sort((a, b) => {
    const aPinned = isLeaguePinned(a.competition.id);
    const bPinned = isLeaguePinned(b.competition.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.competition.name.localeCompare(b.competition.name);
  });

  // Helper to get the correct timezone string
  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  return (
    <div className="space-y-2 px-2 md:px-8">
      {sorted.map(group => {
        const isPinned = mounted && isLeaguePinned(group.competition.id);
        const isOpen = expanded[group.competition.id];
        return (
          <div key={group.competition.id} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 mb-6 md:rounded-lg md:shadow">
            <div
              className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-base md:text-base font-semibold border-b border-gray-200 dark:border-gray-700"
              onClick={() => setExpanded(e => ({ ...e, [group.competition.id]: !e[group.competition.id] }))}
              aria-expanded={isOpen}
            >
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
                  <CountryFlag 
                    imagePath={group.competition.country?.image_path} 
                    countryName={group.competition.country?.name || 'Unknown'} 
                    size="md" 
                  />
                  <Link 
                    href={`/competition/${group.competition.id}-${slugify(group.competition.name)}`}
                    className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    {group.competition.name}
                  </Link>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isOpen && (
              <div className={`collapse-transition expanded`} style={{ opacity: 1 }}>
                {group.matches.map((match: any, idx: number) => {
                  const homeSlug = slugify(match.home_team?.name || 'home');
                  const awaySlug = slugify(match.away_team?.name || 'away');
                  const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                  const isExpanded = expandedMatch === match.id;
                  return (
                    <div key={match.id} className="overflow-x-auto w-full mb-1 mt-1 last:mb-0">
                      <MatchCard
                        match={match}
                        timezone={timezone}
                        isExpanded={isExpanded}
                        showOdds={showOdds}
                        onExpandToggle={e => {
                          e.stopPropagation();
                          setExpandedMatch(isExpanded ? null : match.id);
                        }}
                        onClick={e => {
                          e.preventDefault();
                          router.push(`/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 