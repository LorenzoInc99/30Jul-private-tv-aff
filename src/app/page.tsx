import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_TITLE } from '../lib/constants';
import MatchScheduleWrapper from './MatchScheduleWrapper';

export async function generateMetadata(): Promise<Metadata> {
  // Use a date that has fixtures in the database (November 9, 2025)
  const defaultDate = new Date('2025-11-09');
  const dateString = defaultDate.toLocaleDateString('en-US', { 
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

import NavigationWrapper from './components/NavigationWrapper';

export default function HomePage() {
  return <NavigationWrapper />;
}
