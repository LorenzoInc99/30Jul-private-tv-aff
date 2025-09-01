'use client';

import { useState, useEffect } from 'react';
import NavigationTabs from './NavigationTabs';
import BetCalculator from '../../components/BetCalculator';

type TabType = 'scores' | 'news' | 'bet-calculator';

interface BetCalculatorLayoutProps {
  children: React.ReactNode;
  defaultBetType?: string;
}

export default function BetCalculatorLayout({ children, defaultBetType }: BetCalculatorLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('bet-calculator');
  const [starredMatches, setStarredMatches] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setActiveTab(tab);
    
    // Navigate to appropriate page when changing tabs
    if (tab === 'scores' || tab === 'favourites') {
      window.location.href = '/';
    } else if (tab === 'news') {
      // For now, navigate to home page for news
      window.location.href = '/';
    } else if (tab === 'bet-calculator') {
      // Navigate to main bet calculator page
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
      {isClient && <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />}
      
      {/* Bet Calculator tab - direct integration */}
      {activeTab === 'bet-calculator' && (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <div className="w-full pt-2 pb-4 md:pt-2 md:pb-8 flex-grow">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
