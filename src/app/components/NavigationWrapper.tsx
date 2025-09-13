'use client';

import { useState, useEffect } from 'react';
import NavigationTabs from './NavigationTabs';
import MatchScheduleWrapper from '../MatchScheduleWrapper';

type TabType = 'scores' | 'news' | 'bet-calculator';

export default function NavigationWrapper() {
  const [activeTab, setActiveTab] = useState<TabType>('scores');
  const [starredMatches, setStarredMatches] = useState<Set<string>>(new Set());

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
      <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Tab Content Container with Smooth Transitions */}
      <div className="relative min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
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

    </>
  );
}
