'use client';

import { useState, useEffect } from 'react';
import NavigationTabs from './NavigationTabs';
import MatchScheduleWrapper from '../MatchScheduleWrapper';

type TabType = 'scores' | 'news' | 'favourites' | 'bet-calculator';

export default function NavigationWrapper() {
  const [activeTab, setActiveTab] = useState<TabType>('scores');
  const [starredMatches, setStarredMatches] = useState<Set<string>>(new Set());

  // Load active tab and starred matches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load active tab
      const savedTab = localStorage.getItem('activeTab') as TabType;
      if (savedTab && ['scores', 'news', 'favourites', 'bet-calculator'].includes(savedTab)) {
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
    setActiveTab(tab);
    
    // Navigate to appropriate page when changing tabs
    if (tab === 'bet-calculator') {
      window.location.href = '/bet-calculator';
    }
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
      
      {/* Single MatchSchedule instance that handles both Scores and Favourites */}
      {(activeTab === 'scores' || activeTab === 'favourites') && (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <div className="w-full pt-2 pb-4 md:pt-2 md:pb-8 flex-grow">
            <MatchScheduleWrapper 
              activeTab={activeTab} 
              starredMatches={starredMatches}
              onStarToggle={handleStarToggle}
            />
          </div>
        </div>
      )}
      
      {/* News tab - separate content */}
      {activeTab === 'news' && (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <div className="w-full pt-2 pb-4 md:pt-2 md:pb-8 flex-grow">
            <div className="text-center text-gray-500 py-10">
              News section coming soon...
            </div>
          </div>
        </div>
      )}
      

    </>
  );
}
