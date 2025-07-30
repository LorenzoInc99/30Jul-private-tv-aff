import { Metadata } from 'next';
import CompetitionsListClient from './CompetitionsListClient';
import { getAllCompetitions } from '../../lib/database-adapter';
import { SITE_TITLE } from '../../lib/constants';

export const metadata: Metadata = {
  title: 'All Football Competitions - Live Matches & Fixtures',
  description: 'Browse all football competitions, leagues, and tournaments. Find live matches, schedules, broadcasters, and betting odds for every competition.',
};

export default async function CompetitionsPage() {
  try {
    const competitions = await getAllCompetitions();
    return <CompetitionsListClient competitions={competitions} />;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return <CompetitionsListClient competitions={[]} />;
  }
} 