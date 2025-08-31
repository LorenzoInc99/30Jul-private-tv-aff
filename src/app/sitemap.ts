import { MetadataRoute } from 'next';
import { supabaseServer } from '../lib/supabase';
import { slugify } from '../lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Initialize with fallback data
  let competitions: any[] = [];
  let teams: any[] = [];
  let matches: any[] = [];
  
  // Try to get database data, but don't fail if it doesn't work
  try {
    const supabase = supabaseServer();
    
    // Get all competitions from database
    const { data: competitionsData, error: competitionsError } = await supabase
      .from('leagues')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (!competitionsError && competitionsData && competitionsData.length > 0) {
      competitions = competitionsData;
      console.log('✅ Competitions loaded from DB:', competitionsData.length);
    } else {
      console.log('❌ Competitions error:', competitionsError);
      console.log('❌ Competitions data:', competitionsData);
    }

    // Get all teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams_new')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (!teamsError && teamsData && teamsData.length > 0) {
      teams = teamsData;
      console.log('✅ Teams loaded from DB:', teamsData.length);
    } else {
      console.log('❌ Teams error:', teamsError);
      console.log('❌ Teams data:', teamsData);
    }

    // Get matches from the last 6 months to 1 month in the future
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const { data: matchesData, error: matchesError } = await supabase
      .from('fixtures')
      .select(`
        id, 
        starting_at, 
        home_team: home_team_id(name), 
        away_team: away_team_id(name)
      `)
      .gte('starting_at', sixMonthsAgo.toISOString())
      .lte('starting_at', oneMonthFromNow.toISOString())
      .order('starting_at', { ascending: true });
    
    if (!matchesError && matchesData && matchesData.length > 0) {
      matches = matchesData;
      console.log('✅ Matches loaded from DB:', matchesData.length);
    } else {
      console.log('❌ Matches error:', matchesError);
      console.log('❌ Matches data:', matchesData);
    }
  } catch (error) {
    console.error('Sitemap database error:', error);
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
      url: `${baseUrl}/teams`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/standings`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
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

  // Bet Calculator pages
  const betCalculatorPages = [
    {
      url: `${baseUrl}/bet-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bet-calculator/single`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bet-calculator/double`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bet-calculator/treble`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bet-calculator/accumulator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Competition pages - using the correct URL pattern
  const competitionPages = competitions.map((competition: any) => ({
    url: `${baseUrl}/competition/${competition.id}-${competition.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Team pages - using the correct URL pattern
  const teamPages = teams.map((team: any) => ({
    url: `${baseUrl}/team/${slugify(team.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Match pages - using the correct URL pattern (just the ID)
  const matchPages = matches.map((match: any) => ({
    url: `${baseUrl}/match/${match.id}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  const allPages = [
    ...staticPages,
    ...betCalculatorPages,
    ...competitionPages,
    ...teamPages,
    ...matchPages,
  ];

  console.log('=== SITEMAP DEBUG ===');
  console.log('Base URL:', baseUrl);
  console.log('Static pages count:', staticPages.length);
  console.log('Bet calculator pages count:', betCalculatorPages.length);
  console.log('Competition pages count:', competitionPages.length);
  console.log('Team pages count:', teamPages.length);
  console.log('Match pages count:', matchPages.length);
  console.log('Total pages:', allPages.length);
  console.log('Sample competition URLs:', competitionPages.slice(0, 3).map((p: any) => p.url));
  console.log('Sample team URLs:', teamPages.slice(0, 3).map((p: any) => p.url));
  console.log('Sample match URLs:', matchPages.slice(0, 3).map((p: any) => p.url));
  console.log('=====================');

  return allPages;
} 