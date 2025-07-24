"use client";
import React, { useState } from 'react';

export default function SidebarCompetitions({ competitions }: { competitions: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = competitions.filter((comp: any) =>
    comp.name.toLowerCase().includes(search.toLowerCase())
  );
  const displayed = showAll ? filtered : filtered.slice(0, 5);
  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-gray-900">
      <div className="p-4">
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
        <h2 className="font-bold text-sm mb-4 text-gray-900 dark:text-white">Competitions</h2>
        <ul className="space-y-2">
          {displayed.map((comp: any) => (
            <li key={comp.id}>
              <a
                href={`/competition/${comp.id}-${comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm"
              >
                {comp.name}
              </a>
            </li>
          ))}
        </ul>
        {competitions.length > 5 && (
          <button
            className="mt-4 w-full text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold bg-transparent"
            onClick={() => setShowAll(s => !s)}
          >
            {showAll ? 'Show less' : 'See more'}
          </button>
        )}
      </div>
    </aside>
  );
} 