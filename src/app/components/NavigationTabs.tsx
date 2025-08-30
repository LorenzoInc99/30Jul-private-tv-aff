'use client';

import { useState, useEffect } from 'react';

type TabType = 'scores' | 'news' | 'favourites' | 'bet-calculator';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="w-full bg-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-center px-4 py-3 space-x-8">
        {/* Scores */}
        <div 
          className={`flex items-center px-3 py-2 cursor-pointer ${
            activeTab === 'scores' 
              ? 'text-white border-b-2 border-indigo-500' 
              : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => onTabChange('scores')}
        >
          <span className="font-medium">Scores</span>
        </div>
        
        {/* News */}
        <div 
          className={`flex items-center px-3 py-2 cursor-pointer ${
            activeTab === 'news' 
              ? 'text-white border-b-2 border-indigo-500' 
              : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => onTabChange('news')}
        >
          <span className="font-medium">News</span>
        </div>
        
        {/* Favourites */}
        <div 
          className={`flex items-center px-3 py-2 cursor-pointer ${
            activeTab === 'favourites' 
              ? 'text-white border-b-2 border-indigo-500' 
              : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => onTabChange('favourites')}
        >
          <span className="font-medium">Favourites</span>
        </div>
        
        {/* Bet Calculator */}
        <div 
          className={`flex items-center px-3 py-2 cursor-pointer ${
            activeTab === 'bet-calculator' 
              ? 'text-white border-b-2 border-indigo-500' 
              : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => onTabChange('bet-calculator')}
        >
          <span className="font-medium">Bet Calculator</span>
        </div>
      </div>
    </div>
  );
}
