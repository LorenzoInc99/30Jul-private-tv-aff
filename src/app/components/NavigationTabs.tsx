'use client';

type TabType = 'scores' | 'news' | 'bet-calculator';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="w-full bg-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-center px-4 pt-5 pb-1 space-x-8">
        {/* Scores */}
        <div 
          className={`tab-nav-item flex items-center px-4 py-1 cursor-pointer rounded-lg transition-all duration-200 ${
            activeTab === 'scores' 
              ? 'text-white bg-indigo-600 shadow-lg transform scale-105' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'
          }`}
          onClick={() => onTabChange('scores')}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Scores</span>
        </div>
        
        {/* News */}
        <div 
          className={`tab-nav-item flex items-center px-4 py-1 cursor-pointer rounded-lg transition-all duration-200 ${
            activeTab === 'news' 
              ? 'text-white bg-indigo-600 shadow-lg transform scale-105' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'
          }`}
          onClick={() => onTabChange('news')}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
          </svg>
          <span className="font-medium">News</span>
        </div>
        
        {/* Bet Calculator */}
        <div 
          className={`tab-nav-item flex items-center px-4 py-1 cursor-pointer rounded-lg transition-all duration-200 ${
            activeTab === 'bet-calculator' 
              ? 'text-white bg-indigo-600 shadow-lg transform scale-105' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'
          }`}
          onClick={() => onTabChange('bet-calculator')}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Bet Calculator</span>
        </div>

      </div>
    </div>
  );
}
