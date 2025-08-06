import { supabaseServer } from '../../lib/supabase';
import { Metadata } from 'next';
import TeamsListClient from './TeamsListClient';
import { SITE_TITLE } from '../../lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const description = `Browse all football teams, leagues, and tournaments on ${dateString}. Find live matches, schedules, broadcasters, and betting odds for every team. Complete team profiles and match information.`;
  
  return {
    title: 'All Football Teams - Team Profiles & Match Schedules',
    description,
    keywords: `football teams, soccer teams, team profiles, match schedules, broadcasters, betting odds, ${dateString}`,
    openGraph: {
      title: 'All Football Teams - Team Profiles & Match Schedules',
      description,
      type: 'website',
    },
    twitter: {
      title: 'All Football Teams - Team Profiles & Match Schedules',
      description,
    },
  };
}

// Add Team type
interface Team {
  id: number | string;
  name: string;
  team_logo_url?: string;
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
    .select('competition_id, team_id, Teams(id, name, team_logo_url), Competitions(id, name)')
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