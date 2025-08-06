import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_TITLE } from '../lib/constants';
import MatchScheduleWrapper from './MatchScheduleWrapper';

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const description = `Watch live football today (${dateString})! Find where to watch Premier League, La Liga, Bundesliga, Serie A, Champions League matches and get the best betting odds from licensed bookmakers. Complete TV schedule and live scores.`;
  
  return {
    title: `Live Football TV Guide - ${dateString}`,
    description,
    keywords: `live football ${dateString}, football on tv today, soccer schedule, Premier League, La Liga, Bundesliga, Serie A, Champions League, betting odds, live matches`,
    openGraph: {
      title: `Live Football TV Guide - ${dateString}`,
      description,
      type: 'website',
    },
    twitter: {
      title: `Live Football TV Guide - ${dateString}`,
      description,
    },
  };
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <div className="container mx-auto pt-2 pb-4 md:pt-2 md:pb-8 max-w-7xl flex-grow">
        <Suspense fallback={<div>Loading date navigator...</div>}>
          <MatchScheduleWrapper />
        </Suspense>
      </div>
    </div>
  );
}
