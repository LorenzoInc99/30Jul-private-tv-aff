'use client';

import { useState, useEffect } from 'react';
import MobileMatchCard from './MobileMatchCard';
import MobileSearchFilters from './MobileSearchFilters';

interface MobileHomeLayoutProps {
  matches: any[];
  timezone: string;
  starredMatches: string[];
  onStarToggle: (matchId: string) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: string[]) => void;
}

export default function MobileHomeLayout({
  matches,
  timezone,
  starredMatches,
  onStarToggle,
  onSearch,
  onFilterChange
}: MobileHomeLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('live');

  // Only show on mobile screens
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filter matches based on active tab
  const getFilteredMatches = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case 'live':
        return matches.filter(match => match.status === 'Live');
      case 'today':
        return matches.filter(match => {
          const matchDate = new Date(match.start_time);
          return matchDate >= today && matchDate < tomorrow;
        });
      case 'tomorrow':
        const dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        return matches.filter(match => {
          const matchDate = new Date(match.start_time);
          return matchDate >= tomorrow && matchDate < dayAfterTomorrow;
        });
      case 'weekend':
        return matches.filter(match => {
          const matchDate = new Date(match.start_time);
          const dayOfWeek = matchDate.getDay();
          return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        });
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches();

  if (!isVisible) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:hidden">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Live Football</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Never miss a match</p>
        </div>
      </div>

      {/* Search and Filters */}
      <MobileSearchFilters
        onSearch={onSearch || (() => {})}
        onFilterChange={onFilterChange || (() => {})}
        placeholder="Search teams, leagues..."
        filterOptions={['All', 'Live', 'Today', 'Premier League', 'Champions League', 'Bundesliga', 'Serie A']}
      />

      {/* Tab Navigation */}
      <div className="sticky top-32 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { key: 'live', label: 'Live', count: matches.filter(m => m.status === 'Live').length },
            { key: 'today', label: 'Today', count: matches.filter(m => {
              const matchDate = new Date(m.start_time);
              const today = new Date();
              return matchDate.toDateString() === today.toDateString();
            }).length },
            { key: 'tomorrow', label: 'Tomorrow', count: matches.filter(m => {
              const matchDate = new Date(m.start_time);
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              return matchDate.toDateString() === tomorrow.toDateString();
            }).length },
            { key: 'weekend', label: 'Weekend', count: matches.filter(m => {
              const matchDate = new Date(m.start_time);
              const dayOfWeek = matchDate.getDay();
              return dayOfWeek === 0 || dayOfWeek === 6;
            }).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center space-x-1">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="pb-20">
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matches found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'live' 
                ? 'No live matches at the moment'
                : `No matches scheduled for ${activeTab}`
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredMatches.map((match) => (
              <MobileMatchCard
                key={match.id}
                match={match}
                timezone={timezone}
                showOdds={activeTab !== 'live'}
                showTv={true}
                isStarred={starredMatches.includes(match.id)}
                onStarToggle={onStarToggle}
                onTap={() => {
                  // Navigate to match details
                  const homeSlug = match.home_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'home';
                  const awaySlug = match.away_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'away';
                  const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}`;
                  window.open(matchUrl, '_blank');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions FAB */}
      <div className="fixed bottom-24 right-4 z-40">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
