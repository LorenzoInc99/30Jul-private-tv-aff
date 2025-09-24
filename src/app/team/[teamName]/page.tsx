import { supabaseServer } from '../../../lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamDetailsClient from './TeamDetailsClient';
import { SITE_TITLE } from '../../../lib/constants';
import { slugify } from '../../../lib/utils';

// Generic team lookup function that works for all teams
async function findTeamByName(teamNameSlug: string) {
  const supabase = supabaseServer();
  
  // Strategy 1: Get all teams using pagination to bypass Supabase limits
  let allTeams: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('teams_new')
      .select('*')
      .range(from, from + batchSize - 1);
    
    if (error) {
      console.error('Error fetching teams batch:', error);
      break;
    }
    
    if (batch && batch.length > 0) {
      allTeams = allTeams.concat(batch);
      from += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }
  
  if (allTeams) {
    // Find the team whose slugified name matches our target
    const matchingTeam = allTeams.find((team: any) => {
      const teamSlug = slugify(team.name);
      // Handle both formats: with hyphens (tottenham-hotspur) and without (tottenhamhotspur)
      const teamSlugNoHyphens = teamSlug.replace(/-/g, '');
      const targetSlugNoHyphens = teamNameSlug.replace(/-/g, '');
      
      return teamSlug === teamNameSlug || 
             teamSlugNoHyphens === targetSlugNoHyphens;
    });
    
    if (matchingTeam) {
      return matchingTeam;
    }
  }
  
  // Strategy 2: Try exact match first (fallback)
  let { data: team } = await supabase
    .from('teams_new')
    .select('*')
    .ilike('name', teamNameSlug)
    .single();
  
  if (team) return team;
  
  // Strategy 3: Try with common prefixes and variations
  const variations = [
    // Add common prefixes
    `FC ${teamNameSlug}`,
    `FCK ${teamNameSlug}`,
    `FK ${teamNameSlug}`,
    // Try with spaces (camelCase to spaces)
    teamNameSlug.replace(/([a-z])([A-Z])/g, '$1 $2'),
    // Try with common team name patterns
    teamNameSlug.replace(/united/i, ' United'),
    teamNameSlug.replace(/city/i, ' City'),
    teamNameSlug.replace(/athletic/i, ' Athletic'),
    teamNameSlug.replace(/real/i, 'Real '),
    teamNameSlug.replace(/atletico/i, 'Atlético '),
    // Try with common suffixes
    `${teamNameSlug} FC`,
    `${teamNameSlug} United`,
    `${teamNameSlug} City`,
  ];
  
  for (const variation of variations) {
    const { data } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', variation)
      .single();
    if (data) return data;
  }
  
  // Strategy 4: Try partial matches with fuzzy search
  const { data: partialMatches } = await supabase
    .from('teams_new')
    .select('*')
    .or(`name.ilike.%${teamNameSlug}%,name.ilike.${teamNameSlug}%`)
    .limit(10);
  
  if (partialMatches && partialMatches.length > 0) {
    // Find the best match by comparing slugified names
    const bestMatch = partialMatches.find((t: any) => {
      const teamSlug = slugify(t.name);
      return teamSlug === teamNameSlug || 
             teamSlug.includes(teamNameSlug) || 
             teamNameSlug.includes(teamSlug);
    });
    
    if (bestMatch) return bestMatch;
    
    // If no exact slug match, return the first partial match
    return partialMatches[0];
  }
  
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ teamName: string }> }): Promise<Metadata> {
  const { teamName } = await params;
  
  const team = await findTeamByName(teamName);
  
  if (!team) return { title: 'Team Not Found' };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const description = `Get ${team.name} team profile, recent matches, upcoming fixtures, and live betting odds. Follow ${team.name} performance, results, and find where to watch their games on ${dateString}. Complete team statistics and match schedules.`;
  
  return {
    title: `${team.name} - Team Profile, Matches & Stats`,
    description,
    keywords: `${team.name}, football team, soccer, matches, fixtures, players, stats, betting odds, ${dateString}`,
    openGraph: {
      title: `${team.name} - Team Profile, Matches & Stats`,
      description,
      type: 'website',
    },
    twitter: {
      title: `${team.name} - Team Profile, Matches & Stats`,
      description,
    },
  };
}

export default async function TeamPage({ params }: { params: Promise<{ teamName: string }> }) {
  const { teamName } = await params;
  
  const team = await findTeamByName(teamName);
  
  if (!team) {
    return notFound();
  }

  // Redirect to the new URL format with team ID
  const { redirect } = await import('next/navigation');
  redirect(`/team/${teamName}/${team.id}`);
} 