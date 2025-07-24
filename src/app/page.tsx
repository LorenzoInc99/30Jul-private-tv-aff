'use client';

import { Suspense } from 'react';
import MatchSchedule from './MatchSchedule';
import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_TITLE } from '../lib/constants';
import { useState } from 'react';
import TimezoneSelector from './TimezoneSelector';

export default function HomePage() {
  const [timezone, setTimezone] = useState('auto');
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <div className="container mx-auto pt-2 pb-4 md:pt-2 md:pb-8 max-w-7xl flex-grow">
        <Suspense fallback={<div>Loading date navigator...</div>}>
          <MatchSchedule timezone={timezone} setTimezone={setTimezone} />
        </Suspense>
      </div>
    </div>
  );
}
