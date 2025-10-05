'use client';

import { useState, useEffect } from 'react';
import MatchScheduleWrapper from '../MatchScheduleWrapper';
import DateNavigator from '../DateNavigator';

type TabType = 'scores' | 'news' | 'bet-calculator';

export default function NavigationWrapper() {
  const [activeTab, setActiveTab] = useState<TabType>('scores');
  const [starredMatches, setStarredMatches] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'finished' | 'upcoming'>('all');
  const [showOdds, setShowOdds] = useState(true);
  const [showTv, setShowTv] = useState(true);

  // Load active tab and starred matches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load active tab
      const savedTab = localStorage.getItem('activeTab') as TabType;
      if (savedTab && ['scores', 'news', 'bet-calculator'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
      
      // Load starred matches
      const savedStarredMatches = localStorage.getItem('starredMatches');
      if (savedStarredMatches) {
        try {
          const starredArray = JSON.parse(savedStarredMatches);
          setStarredMatches(new Set(starredArray));
        } catch (e) {
          console.error('Error loading starred matches:', e);
        }
      }

      // Initialize selectedDate to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);

      // Load odds and TV preferences
      const savedOdds = localStorage.getItem('showOdds');
      if (savedOdds !== null) {
        setShowOdds(savedOdds === 'true');
      }
      
      const savedTv = localStorage.getItem('showTv');
      if (savedTv !== null) {
        setShowTv(savedTv === 'true');
      }
    }
  }, []);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  // Save starred matches to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('starredMatches', JSON.stringify(Array.from(starredMatches)));
    }
  }, [starredMatches]);

  // Save odds preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showOdds', showOdds.toString());
    }
  }, [showOdds]);

  // Save TV preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showTv', showTv.toString());
    }
  }, [showTv]);

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
  };

  const handleStarToggle = (matchId: string) => {
    setStarredMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Mobile Date Navigation - Compact */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            {/* Date Navigation with Today/Live Button - Compact */}
            <div className="flex items-center gap-1">
              {/* Pill-shaped calendar navigation */}
              <div className="flex items-center bg-gray-700 dark:bg-gray-800 rounded-full px-2 py-1">
                <button 
                  onClick={() => {
                    if (selectedDate) {
                      const prevDate = new Date(selectedDate.getTime() - 86400000);
                      setSelectedDate(prevDate);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-1 mx-1.5">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">
                    {selectedDate ? selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : 'Today'}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    if (selectedDate) {
                      const nextDate = new Date(selectedDate.getTime() + 86400000);
                      setSelectedDate(nextDate);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
                </button>
          </div>
          
              {/* Today/Live Button next to calendar - closer */}
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = selectedDate && selectedDate.toDateString() === today.toDateString();
                
                if (!isToday) {
                  // Show Today button when not on today's date
                  return (
                    <button
                      onClick={() => {
                        const todayDate = new Date();
                        todayDate.setHours(0, 0, 0, 0);
                        setSelectedDate(todayDate);
                      }}
                      className="ml-1 px-2.5 py-1 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200"
                    >
                      Today
                    </button>
                  );
                }

                // When date is today, show Live toggle
                return (
                  <button
                    onClick={() => setSelectedFilter(selectedFilter === 'live' ? 'all' : 'live')}
                    className={`ml-1 px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedFilter === 'live'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Live
                  </button>
                );
              })()}
          </div>
          
            {/* Odds/TV Toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${
                showOdds ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                Odds
              </span>
              <button
                onClick={() => {
                  setShowOdds(!showOdds);
                  setShowTv(!showTv);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
                  showOdds ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showOdds ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${
                showTv ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                TV
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Content Container with Smooth Transitions */}
      <div className="relative min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300 pb-20 md:pb-0">
        {/* Scores tab */}
        <div 
          className={`tab-transition ${
            activeTab === 'scores' 
              ? 'opacity-100 translate-y-0 relative z-10' 
              : 'opacity-0 translate-y-2 pointer-events-none absolute inset-0 z-0'
          }`}
        >
          <div className="w-full pt-2 pb-4 md:pt-2 md:pb-8 flex-grow">
            <MatchScheduleWrapper 
              activeTab={activeTab} 
              starredMatches={starredMatches}
              onStarToggle={handleStarToggle}
              selectedDate={selectedDate}
              selectedFilter={selectedFilter}
              showOdds={showOdds}
              showTv={showTv}
            />
          </div>
        </div>
        
        {/* News tab - separate content */}
        <div 
          className={`tab-transition ${
            activeTab === 'news' 
              ? 'opacity-100 translate-y-0 relative z-10' 
              : 'opacity-0 translate-y-2 pointer-events-none absolute inset-0 z-0'
          }`}
        >
          <div className="w-full pt-2 pb-4 md:pt-2 md:pb-8 flex-grow">
            <div className="text-center text-gray-500 py-10">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">News Section</h3>
                <p className="text-gray-400 mb-6">Stay updated with the latest football news, transfer rumors, and match analysis.</p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                  <div className="text-sm text-gray-500">Coming soon...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bet Calculator tab - inline content */}
        <div 
          className={`tab-transition ${
            activeTab === 'bet-calculator' 
              ? 'opacity-100 translate-y-0 relative z-10' 
              : 'opacity-0 translate-y-2 pointer-events-none absolute inset-0 z-0'
          }`}
        >
          <div className="w-full pt-2 pb-4 md:pt-2 md:pb-8 flex-grow">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Bet Calculator
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Calculate your potential returns for singles, doubles, trebles, and accumulators
                </p>
              </div>
              
              {/* Quick navigation to full bet calculator */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    For the full bet calculator experience with advanced features
                  </p>
                  <a 
                    href="/bet-calculator" 
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Go to Full Bet Calculator
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Simple bet calculator preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Bet Calculator
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stake Amount
                    </label>
                    <input 
                      type="number" 
                      placeholder="£10.00" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Odds
                    </label>
                    <input 
                      type="number" 
                      placeholder="2.50" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Potential Return</p>
                    <p className="text-2xl font-bold text-green-600">£25.00</p>
                    <p className="text-sm text-gray-500">Profit: £15.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
        <div className="flex justify-around items-center py-2 px-2">
          <button
            onClick={() => handleTabChange('scores')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
              activeTab === 'scores'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium mt-1">Scores</span>
          </button>
          
          <button
            onClick={() => handleTabChange('news')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
              activeTab === 'news'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs font-medium mt-1">News</span>
          </button>
          
          <button
            onClick={() => handleTabChange('bet-calculator')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
              activeTab === 'bet-calculator'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium mt-1">Calculator</span>
          </button>
        </div>
      </div>

    </>
  );
}
