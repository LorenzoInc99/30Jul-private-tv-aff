import { supabaseServer } from '../../lib/supabase';
import { Metadata } from 'next';
import TeamsListClient from './TeamsListClient';
import { SITE_TITLE } from '../../lib/constants';

export const metadata: Metadata = {
  title: 'All Competitions - League & Tournament Profiles',
  description: 'Browse all football competitions, leagues, and tournaments. Find live matches, schedules, broadcasters, and betting odds for every competition.',
  keywords: 'football competitions, soccer leagues, tournaments, match schedules, broadcasters, betting odds',
};

// Add Team type
interface Team {
  id: number | string;
  name: string;
  logo_url?: string;
  competition_id?: number | string;
  home_matches?: { count: number }[];
  away_matches?: { count: number }[];
  totalMatches?: number;
  [key: string]: any;
}

interface Competition {
  id: number | string;
  name: string;
}

export default async function TeamsPage() {
  const supabase = supabaseServer();

  // Fetch all competitions
  const { data: competitions } = await supabase
    .from('Competitions')
    .select('id, name')
    .order('name', { ascending: true });

  // Fetch all team_competitions with team and competition info
  const { data: teamComps } = await supabase
    .from('team_competitions')
    .select('competition_id, team_id, Teams(id, name, logo_url), Competitions(id, name)')
    .order('competition_id', { ascending: true });

  // Group teams by competition
  const grouped: { competition: { id: number|string, name: string }, teams: any[] }[] = (competitions || []).map((comp: { id: number|string, name: string }) => {
    const teams = (teamComps || [])
      .filter((tc: any) => tc.competition_id === comp.id && tc.Teams)
      .map((tc: any) => tc.Teams);
    return {
      competition: comp,
      teams,
    };
  }).filter((group: { competition: { id: number|string, name: string }, teams: any[] }) => group.teams.length > 0);

  return <TeamsListClient grouped={grouped} />;
} 