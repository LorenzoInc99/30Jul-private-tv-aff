"use client";
import React, { useState, useEffect } from 'react';
import { getPinnedLeagues, togglePinnedLeague, isLeaguePinned } from '../../lib/pinned-leagues';
import LeagueLogo from '../../components/LeagueLogo';

export default function SidebarCompetitions({ competitions }: { competitions: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Popular leagues data
  const popularLeagues = [
    { id: 8, name: 'Premier League', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/8.png' },
    { id: 564, name: 'La Liga', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/564.png' },
    { id: 82, name: 'Bundesliga', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/82.png' },
    { id: 384, name: 'Serie A', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/384.png' },
    { id: 301, name: 'Ligue 1', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/301.png' }
  ];

  // Load pinned leagues on mount and when competitions change
  useEffect(() => {
    setMounted(true);
    updatePinnedLeagues();
  }, [competitions]);

  // Listen for pinned league changes from other components
  useEffect(() => {
    const handlePinnedLeaguesChange = () => {
      updatePinnedLeagues();
    };

    window.addEventListener('pinnedLeaguesChanged', handlePinnedLeaguesChange);
    return () => {
      window.removeEventListener('pinnedLeaguesChanged', handlePinnedLeaguesChange);
    };
  }, []);

  const updatePinnedLeagues = () => {
    const pinned = getPinnedLeagues();
    // Directly use the pinned leagues from localStorage, don't filter against competitions
    setPinnedLeagues(pinned);
    
    console.log('=== SIDEBAR DEBUG ===');
    console.log('Competitions count:', competitions.length);
    console.log('Competitions:', JSON.stringify(competitions.map(c => ({ id: c.id, name: c.name })), null, 2));
    console.log('Pinned from storage:', JSON.stringify(pinned, null, 2));
    console.log('Pinned leagues count (direct from storage):', pinned.length);
    console.log('====================');
  };

  const filtered = competitions.filter((comp: any) =>
    comp.name.toLowerCase().includes(search.toLowerCase())
  );
  const displayed = showAll ? filtered : filtered.slice(0, 5);

  const handlePinToggle = (league: any) => {
    togglePinnedLeague(league);
    updatePinnedLeagues();
  };

  const renderLeagueItem = (comp: any, isPinned = false) => (
    <li key={comp.id} className="flex items-center justify-between group">
      <a
        href={`/competition/${comp.id}-${comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
        className="flex-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm py-1 flex items-center"
      >
        <LeagueLogo 
          logoUrl={comp.league_logo} 
          leagueName={comp.name} 
          leagueId={comp.id}
          size="sm" 
          className="mr-2 flex-shrink-0"
        />
        {comp.name}
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePinToggle(comp);
        }}
        className={`ml-2 p-1 rounded transition-colors ${
          isPinned 
            ? 'text-yellow-500 hover:text-yellow-600' 
            : 'text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
        }`}
        title={isPinned ? 'Unpin league' : 'Pin league'}
        aria-label={isPinned ? 'Unpin league' : 'Pin league'}
      >
        <svg 
          className="w-4 h-4" 
          fill={isPinned ? "currentColor" : "none"} 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>
    </li>
  );

  const renderPopularLeagueItem = (comp: any) => (
    <li key={comp.id} className="flex items-center justify-between group">
      <a
        href={`/competition/${comp.id}-${comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
        className="flex-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm py-1 flex items-center"
      >
        <LeagueLogo 
          logoUrl={comp.league_logo} 
          leagueName={comp.name} 
          leagueId={comp.id}
          size="sm" 
          className="mr-2 flex-shrink-0"
        />
        {comp.name}
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePinToggle(comp);
        }}
        className={`ml-2 p-1 rounded transition-colors ${
          isLeaguePinned(comp.id)
            ? 'text-yellow-500 hover:text-yellow-600' 
            : 'text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
        }`}
        title={isLeaguePinned(comp.id) ? 'Unpin league' : 'Pin league'}
        aria-label={isLeaguePinned(comp.id) ? 'Unpin league' : 'Pin league'}
      >
        <svg 
          className="w-4 h-4" 
          fill={isLeaguePinned(comp.id) ? "currentColor" : "none"} 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>
    </li>
  );

  // Determine what to show based on pinned leagues
  const hasPinnedLeagues = mounted && pinnedLeagues.length > 0;
  
  // If we have pinned leagues but no competitions from DB, use pinned leagues directly
  const leaguesToShow = hasPinnedLeagues && competitions.length === 0 
    ? pinnedLeagues 
    : hasPinnedLeagues 
      ? pinnedLeagues 
      : displayed;

  console.log('=== SIDEBAR RENDER ===');
  console.log('Mounted:', mounted);
  console.log('Has pinned leagues:', hasPinnedLeagues);
  console.log('Pinned leagues count:', pinnedLeagues.length);
  console.log('Leagues to show count:', leaguesToShow.length);
  console.log('Competitions count:', competitions.length);
  console.log('Leagues to show:', JSON.stringify(leaguesToShow.map(c => ({ id: c.id, name: c.name })), null, 2));
  console.log('======================');

  return (
    <aside className="block w-64 bg-white dark:bg-gray-900 h-full min-h-screen">
      <div className="p-4 h-full">
        {/* Search bar */}
        <div className="mb-4 w-full">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              aria-label="Search competitions"
            />
          </div>
        </div>



        {/* Popular Leagues Section */}
        <div className="mb-6">
          <h2 className="font-bold text-sm mb-4 text-gray-900 dark:text-white flex items-center">
            Popular Leagues
          </h2>
          <ul className="space-y-1">
            {popularLeagues.map((comp: any) => renderPopularLeagueItem(comp))}
          </ul>
        </div>

        {/* Pinned Leagues Section */}
        {hasPinnedLeagues && (
          <div className="mb-6">
            <h2 className="font-bold text-sm mb-4 text-gray-900 dark:text-white flex items-center">
              Pinned Leagues
            </h2>
            <ul className="space-y-1">
              {leaguesToShow.map((comp: any) => renderLeagueItem(comp, isLeaguePinned(comp.id)))}
            </ul>
          </div>
        )}

        {/* Pinned Leagues Section - show message when no pinned leagues */}
        {!hasPinnedLeagues && (
          <div>
            <h2 className="font-bold text-sm mb-4 text-gray-900 dark:text-white flex items-center">
              Pinned Leagues
            </h2>
            <div className="text-gray-500 dark:text-gray-400 text-sm py-2">
              Add your favourite league
            </div>
          </div>
        )}
      </div>
    </aside>
  );
} 