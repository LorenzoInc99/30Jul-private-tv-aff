"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatchCard from '../components/MatchCard';

function getInitialFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('favoriteLeagues') || '[]');
  } catch {
    return [];
  }
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function LeagueSchedule({ competitions, timezone = 'auto' }: { competitions: any[]; timezone?: string }) {
  const [favoriteLeagues, setFavoriteLeagues] = useState<number[]>(getInitialFavorites());
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null); // NEW: track expanded match for TV
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('favoriteLeagues', JSON.stringify(favoriteLeagues));
  }, [favoriteLeagues]);



  useEffect(() => {
    // Expand all by default on mount
    const all: { [id: number]: boolean } = {};
    competitions.forEach(c => { all[c.competition.id] = true; });
    setExpanded(all);
  }, [competitions]);

  // Sort: favorites first, then alphabetical
  const sorted = [...competitions].sort((a, b) => {
    const aFav = favoriteLeagues.includes(a.competition.id);
    const bFav = favoriteLeagues.includes(b.competition.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
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
        const isFav = favoriteLeagues.includes(group.competition.id);
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
                  className={`favorite-star w-5 h-5 ${isFav ? 'text-yellow-400 dark:text-yellow-300' : 'text-gray-400 dark:text-gray-500'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  onClick={e => { e.stopPropagation(); setFavoriteLeagues(favs => favs.includes(group.competition.id) ? favs.filter(id => id !== group.competition.id) : [...favs, group.competition.id]); }}
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <Link 
                  href={`/competition/${group.competition.id}-${slugify(group.competition.name)}`}
                  className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {group.competition.name}
                </Link>
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
                    <div key={match.id} className="overflow-x-auto w-full">
                      <MatchCard
                        match={match}
                        timezone={timezone}
                        isExpanded={isExpanded}
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