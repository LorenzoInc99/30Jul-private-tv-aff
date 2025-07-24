import { supabaseServer } from '../../lib/supabase';
import { Metadata } from 'next';
import CompetitionsListClient from './CompetitionsListClient';
import { SITE_TITLE } from '../../lib/constants';

export const metadata: Metadata = {
  title: 'All Football Competitions - Live Matches & Fixtures',
  description: 'Browse all football competitions, leagues, and tournaments. Find live matches, schedules, broadcasters, and betting odds for every competition.',
};

export default async function CompetitionsPage() {
  const supabase = supabaseServer();
  
  // Get all competitions with match counts
  const { data: competitions } = await supabase
    .from('Competitions')
    .select(`
      *,
      Events(count)
    `)
    .order('name', { ascending: true });

  return <CompetitionsListClient competitions={competitions || []} />;
} 