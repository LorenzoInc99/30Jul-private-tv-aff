"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPinnedLeagues, togglePinnedLeague, isLeaguePinned } from '../../lib/pinned-leagues';

export default function MobileCompetitionsMenu({ competitions }: { competitions: { id: number; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Load pinned leagues on mount
  useEffect(() => {
    setMounted(true);
    const pinned = getPinnedLeagues();
    const pinnedCompetitions = competitions.filter(comp => 
      pinned.some(p => p.id === comp.id)
    );
    setPinnedLeagues(pinnedCompetitions);
  }, [competitions]);

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  const handlePinToggle = (league: any) => {
    togglePinnedLeague(league);
    
    // Update local state
    const pinned = getPinnedLeagues();
    const pinnedCompetitions = competitions.filter(comp => 
      pinned.some(p => p.id === comp.id)
    );
    setPinnedLeagues(pinnedCompetitions);
  };

  const renderLeagueItem = (comp: any, isPinned = false) => (
    <li key={comp.id} className="flex items-center justify-between group">
      <a
        href={`/competition/${comp.id}-${slugify(comp.name)}`}
        className="flex-1 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-base font-medium py-1"
        onClick={() => setOpen(false)}
      >
        {comp.name}
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePinToggle(comp);
        }}
        className={`ml-3 p-1 rounded transition-colors ${
          isPinned 
            ? 'text-yellow-500 hover:text-yellow-600' 
            : 'text-gray-400 hover:text-yellow-500'
        }`}
        title={isPinned ? 'Unpin league' : 'Pin league'}
        aria-label={isPinned ? 'Unpin league' : 'Pin league'}
      >
        <svg 
          className="w-5 h-5" 
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

  // Determine what to show based on pinned leagues
  const hasPinnedLeagues = mounted && pinnedLeagues.length > 0;
  const leaguesToShow = hasPinnedLeagues ? pinnedLeagues : competitions;
  const sectionTitle = hasPinnedLeagues ? "Pinned Leagues" : "All Competitions";

  return (
    <>
      <button
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Open competitions menu"
        onClick={() => setOpen(true)}
      >
        {/* Hamburger icon */}
        <svg className="w-7 h-7 text-gray-900 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end" onClick={() => setOpen(false)}>
          <nav
            className="w-64 h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-y-auto"
            aria-label="Competitions menu"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Competitions</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Leagues Section */}
            <div>
              <h2 className="font-bold text-sm mb-3 text-gray-900 dark:text-white flex items-center">
                {hasPinnedLeagues && (
                  <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
                {sectionTitle}
              </h2>
              <ul className="space-y-2">
                {leaguesToShow.map(comp => renderLeagueItem(comp, isLeaguePinned(comp.id)))}
              </ul>
            </div>
          </nav>
        </div>
      )}
    </>
  );
} 