'use client';

import { useState, useEffect } from 'react';
import MatchSchedule from './MatchSchedule';

function getInitialTimezone() {
  if (typeof window === 'undefined') return 'auto';
  return localStorage.getItem('userTimezone') || 'auto';
}

export default function MatchScheduleWrapper({ 
  activeTab = 'scores',
  starredMatches = new Set<string>(),
  onStarToggle
}: { 
  activeTab?: 'scores' | 'news' | 'favourites' | 'bet-calculator';
  starredMatches?: Set<string>;
  onStarToggle?: (matchId: string) => void;
}) {
  const [timezone, setTimezone] = useState('auto');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTimezone(getInitialTimezone());
    setHydrated(true);
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