'use client';

import { useState, useEffect } from 'react';

export default function HeaderTimezoneSelector() {
  const [timezone, setTimezone] = useState('auto');

  useEffect(() => {
    // Get initial timezone from localStorage
    if (typeof window !== 'undefined') {
      setTimezone(localStorage.getItem('timezone') || 'auto');
    }
  }, []);

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setTimezone(newTimezone);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('timezone', newTimezone);
      window.dispatchEvent(new CustomEvent('timezoneChanged', { detail: newTimezone }));
    }
  };

  return (
    <div className="hidden md:block">
      <select
        id="timezone-select"
        className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:outline-none focus:ring-0 focus:border-0 px-3 py-1.5"
        value={timezone}
        onChange={handleTimezoneChange}
      >
        <option value="auto">Auto</option>
        <option value="Europe/London">GMT/BST</option>
        <option value="Europe/Paris">CET/CEST</option>
        <option value="America/New_York">EST/EDT</option>
        <option value="America/Los_Angeles">PST/PDT</option>
        <option value="UTC">UTC</option>
      </select>
    </div>
  );
}
