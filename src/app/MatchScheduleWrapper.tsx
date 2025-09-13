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
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
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