'use client';

import { useState, useEffect } from 'react';

interface MobileSearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  placeholder?: string;
  filterOptions?: string[];
}

export default function MobileSearchFilters({ 
  onSearch, 
  onFilterChange, 
  placeholder = "Search teams, leagues...",
  filterOptions = ['All', 'Live', 'Today', 'Premier League', 'Champions League', 'Bundesliga', 'Serie A']
}: MobileSearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [isVisible, setIsVisible] = useState(false);

  // Only show on mobile screens
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  // Handle filter selection
  const handleFilterToggle = (filter: string) => {
    let newFilters;
    if (filter === 'All') {
      newFilters = ['All'];
    } else {
      newFilters = selectedFilters.includes(filter)
        ? selectedFilters.filter(f => f !== filter)
        : [...selectedFilters.filter(f => f !== 'All'), filter];
      
      if (newFilters.length === 0) {
        newFilters = ['All'];
      }
    }
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 md:hidden">
      <div className="p-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 border rounded-lg transition-colors ${
              showFilters 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>
        
        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterToggle(filter)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedFilters.includes(filter)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {/* Active Filters Summary */}
            {selectedFilters.length > 0 && selectedFilters[0] !== 'All' && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFilters.length} filter{selectedFilters.length > 1 ? 's' : ''} active
                </span>
                <button
                  onClick={() => {
                    setSelectedFilters(['All']);
                    onFilterChange(['All']);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
