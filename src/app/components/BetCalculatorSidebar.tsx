"use client";
import React, { useState, useEffect } from 'react';

export default function BetCalculatorSidebar() {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bet calculator types data
  const betTypes = [
    { 
      id: 'single', 
      name: 'Single Bet', 
      description: 'One selection',
      href: '/bet-calculator/single'
    },
    { 
      id: 'double', 
      name: 'Double Bet', 
      description: 'Two selections',
      href: '/bet-calculator/double'
    },
    { 
      id: 'treble', 
      name: 'Treble Bet', 
      description: 'Three selections',
      href: '/bet-calculator/treble'
    },
    { 
      id: 'accumulator', 
      name: 'Accumulator', 
      description: '4+ selections',
      href: '/bet-calculator/accumulator'
    }
  ];

  // Popular bet types (like popular leagues)
  const popularBetTypes = [
    { id: 'single', name: 'Single Bet', href: '/bet-calculator/single' },
    { id: 'double', name: 'Double Bet', href: '/bet-calculator/double' },
    { id: 'treble', name: 'Treble Bet', href: '/bet-calculator/treble' },
    { id: 'accumulator', name: 'Accumulator', href: '/bet-calculator/accumulator' }
  ];

  const filtered = betTypes.filter((betType) =>
    betType.name.toLowerCase().includes(search.toLowerCase())
  );
  const displayed = filtered.slice(0, 5);

  const renderBetTypeItem = (betType: any) => (
    <li key={betType.id} className="flex items-center justify-between group">
      <a
        href={betType.href}
        className="flex-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm py-1 flex items-center"
      >
        <div>
          <div className="font-medium">{betType.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{betType.description}</div>
        </div>
      </a>
      <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </li>
  );

  const renderPopularBetTypeItem = (betType: any) => (
    <li key={betType.id} className="flex items-center justify-between group">
      <a
        href={betType.href}
        className="flex-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm py-1 flex items-center"
      >
        {betType.name}
      </a>
      <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </li>
  );

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
              placeholder="Search bet types"
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              aria-label="Search bet types"
            />
          </div>
        </div>

        {/* Popular Bet Types Section */}
        <div className="mb-6">
          <h2 className="!text-[20px] !font-normal uppercase tracking-wider mb-2 !text-gray-400 dark:!text-gray-500 flex items-center">
            Popular Bet Types
          </h2>
          <ul className="space-y-1">
            {popularBetTypes.map((betType) => renderPopularBetTypeItem(betType))}
          </ul>
        </div>

        {/* All Bet Types Section */}
        <div className="mb-6">
          <h2 className="!text-[20px] !font-normal uppercase tracking-wider mb-2 !text-gray-400 dark:!text-gray-500 flex items-center">
            All Bet Types
          </h2>
          <ul className="space-y-1">
            {displayed.map((betType) => renderBetTypeItem(betType))}
          </ul>
          {filtered.length > 5 && (
            <div className="text-center mt-2">
              <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                Show all ({filtered.length})
              </button>
            </div>
          )}
        </div>




      </div>
    </aside>
  );
}
