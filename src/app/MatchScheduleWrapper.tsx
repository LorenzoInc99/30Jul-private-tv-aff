'use client';

import { useState, useEffect } from 'react';
import MatchSchedule from './MatchSchedule';

function getInitialTimezone() {
  if (typeof window === 'undefined') return 'auto';
  return localStorage.getItem('timezone') || 'auto';
}

export default function MatchScheduleWrapper({ 
  activeTab = 'scores',
  starredMatches = new Set<string>(),
  onStarToggle
}: { 
  activeTab?: 'scores' | 'news' | 'bet-calculator';
  starredMatches?: Set<string>;
  onStarToggle?: (matchId: string) => void;
}) {
  const [timezone, setTimezone] = useState('auto');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTimezone(getInitialTimezone());
    setHydrated(true);
    
    // Listen for timezone changes from header
    const handleTimezoneChange = (event: CustomEvent) => {
      setTimezone(event.detail);
    };
    
    window.addEventListener('timezoneChanged', handleTimezoneChange as EventListener);
    
    return () => {
      window.removeEventListener('timezoneChanged', handleTimezoneChange as EventListener);
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MatchSchedule 
      timezone={timezone} 
      setTimezone={setTimezone} 
      activeTab={activeTab}
      starredMatches={starredMatches}
      onStarToggle={onStarToggle}
    />
  );
} 