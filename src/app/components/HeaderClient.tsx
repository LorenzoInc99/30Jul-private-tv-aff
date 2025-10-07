'use client';

import HeaderLogo from './HeaderLogo';
import HeaderTimezoneSelector from '../../components/HeaderTimezoneSelector';
import { useState, useEffect } from 'react';

type TabType = 'scores' | 'news' | 'bet-calculator';

export default function HeaderClient({ competitions }: { competitions: any[] }) {
  const [activeTab, setActiveTab] = useState<TabType>('scores');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Load active tab from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTab') as TabType;
      if (savedTab && ['scores', 'news', 'bet-calculator'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', tab);
    }
    
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

  return (
    <header className={`w-full border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 flex items-center px-2 md:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="w-full max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <HeaderLogo />
          
          {/* Navigation Tabs - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Scores */}
            <div 
              className={`flex items-center px-3 py-1 cursor-pointer rounded-lg transition-all duration-200 ${
                activeTab === 'scores' 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleTabChange('scores')}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-sm">Scores</span>
            </div>
            
            {/* News */}
            <div 
              className={`flex items-center px-3 py-1 cursor-pointer rounded-lg transition-all duration-200 ${
                activeTab === 'news' 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleTabChange('news')}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
              </svg>
              <span className="font-medium text-sm">News</span>
            </div>
            
            {/* Bet Calculator */}
            <div 
              className={`flex items-center px-3 py-1 cursor-pointer rounded-lg transition-all duration-200 ${
                activeTab === 'bet-calculator' 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleTabChange('bet-calculator')}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-sm">Bet Calculator</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Timezone Selector */}
          <HeaderTimezoneSelector />
        </div>
      </div>
      </div>
    </header>
  );
}
