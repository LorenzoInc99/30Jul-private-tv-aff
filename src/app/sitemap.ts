import { MetadataRoute } from 'next';
import { supabaseServer } from '../lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com'; // Replace with your actual domain
  
  const supabase = supabaseServer();
  
  // Get all competitions
  const { data: competitions, error: competitionsError } = await supabase
    .from('Competitions')
    .select('id, name, created_at')
    .order('name', { ascending: true });
  if (competitionsError) {
    console.error('Competitions error:', competitionsError);
  } else if (!competitions) {
    console.error('Failed to fetch competitions');
  }

  // Get all teams
  const { data: teams, error: teamsError } = await supabase
    .from('Teams')
    .select('id, name, created_at')
    .order('name', { ascending: true });
  if (teamsError) {
    console.error('Teams error:', teamsError);
  } else if (!teams) {
    console.error('Failed to fetch teams');
  }

  // Get matches from the last 6 months to 1 month in the future
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const { data: matches, error: matchesError } = await supabase
    .from('Events')
    .select(`
      id, 
      start_time, 
      home_team: Teams!Events_home_team_id_fkey(name), 
      away_team: Teams!Events_away_team_id_fkey(name),
      created_at
    `)
    .gte('start_time', sixMonthsAgo.toISOString())
    .lte('start_time', oneMonthFromNow.toISOString())
    .order('start_time', { ascending: true });
  if (matchesError) {
    console.error('Matches error:', matchesError);
  } else if (!matches) {
    console.error('Failed to fetch matches');
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/competitions`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Competition pages
  const competitionPages = (competitions || []).map((competition: any) => ({
    url: `${baseUrl}/competition/${competition.id}-${competition.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
    lastModified: competition.created_at ? new Date(competition.created_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Team pages
  const teamPages = (teams || []).map((team: any) => ({
    url: `${baseUrl}/team/${team.id}-${team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
    lastModified: team.created_at ? new Date(team.created_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Match pages
  const matchPages = (matches || []).map((match: any) => ({
    url: `${baseUrl}/match/${match.id}-${match.home_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'home'}-vs-${match.away_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'away'}`,
    lastModified: match.created_at ? new Date(match.created_at) : new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...competitionPages,
    ...teamPages,
    ...matchPages,
  ];
} 