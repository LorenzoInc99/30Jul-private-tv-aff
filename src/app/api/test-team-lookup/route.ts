import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Simple fuzzy search function
function fuzzySearch(searchTerm: string, target: string): number {
  const search = searchTerm.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match gets highest score
  if (search === targetLower) return 1.0;
  
  // Contains match gets high score
  if (targetLower.includes(search) || search.includes(targetLower)) return 0.8;
  
  // Calculate similarity based on common characters
  let score = 0;
  let searchIndex = 0;
  
  for (let i = 0; i < targetLower.length && searchIndex < search.length; i++) {
    if (targetLower[i] === search[searchIndex]) {
      score++;
      searchIndex++;
    }
  }
  
  return score / Math.max(search.length, targetLower.length);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamSlug = searchParams.get('slug') || 'fckobenhavn';
    
    const supabase = supabaseServer();
    
    // For the new format, we need to try different variations since the slug is compact
    // Example: "fckobenhavn" could be "FC København", "FCK København", etc.
    
    // Enhanced search terms with more variations
    const alternativeSearchTerms = [
      // Try exact match first
      teamSlug,
      // Try with common prefixes
      `FC ${teamSlug}`,
      `FCK ${teamSlug}`,
      // Try with spaces in different positions
      teamSlug.replace(/([a-z])([A-Z])/g, '$1 $2'), // camelCase to spaces
      // Handle specific cases for FC København
      teamSlug.replace(/fc/i, 'FC '),
      teamSlug.replace(/kobenhavn/i, 'København'),
      teamSlug.replace(/fckobenhavn/i, 'FC København'),
      // Handle typos and missing characters
      teamSlug.replace(/fckbenhavn/i, 'FC København'), // Missing 'o'
      teamSlug.replace(/kbenhavn/i, 'København'), // Missing 'o'
      // Try with common team name patterns
      teamSlug.replace(/united/i, ' United'),
      teamSlug.replace(/city/i, ' City'),
      teamSlug.replace(/athletic/i, ' Athletic'),
      teamSlug.replace(/real/i, 'Real '),
      teamSlug.replace(/atletico/i, 'Atlético '),
    ];
    
    console.log('Looking for team with slug:', teamSlug);
    console.log('Converted to search terms:', alternativeSearchTerms);
    
    // Try to find team with multiple search terms
    let team = null;
    let error = null;
    let searchMethod = '';
    
    // First try exact matches
    for (const searchTerm of alternativeSearchTerms) {
      const { data, err } = await supabase
        .from('teams_new')
        .select('*')
        .ilike('name', searchTerm)
        .single();
      if (data) {
        team = data;
        searchMethod = `exact match: "${searchTerm}"`;
        break;
      }
      if (err && err.code !== 'PGRST116') error = err; // PGRST116 is "not found"
    }
    
    // If no exact match, try partial matches
    if (!team) {
      for (const searchTerm of alternativeSearchTerms) {
        const { data, err } = await supabase
          .from('teams_new')
          .select('*')
          .ilike('name', `%${searchTerm}%`)
          .limit(10);
        if (data && data.length > 0) {
          // Find the best match using fuzzy search
          const scoredTeams = data.map((t: any) => ({
            team: t,
            score: fuzzySearch(searchTerm, t.name)
          })).sort((a: any, b: any) => b.score - a.score);
          
          team = scoredTeams[0].team;
          searchMethod = `fuzzy match: "${searchTerm}" (score: ${scoredTeams[0].score.toFixed(2)}, found ${data.length} teams)`;
          break;
        }
        if (err) error = err;
      }
    }
    
    // If still no match, try a broader search with fuzzy matching
    if (!team) {
      const { data, err } = await supabase
        .from('teams_new')
        .select('*')
        .limit(100);
      
      if (data && data.length > 0) {
        const scoredTeams = data.map((t: any) => ({
          team: t,
          score: fuzzySearch(teamSlug, t.name)
        })).sort((a: any, b: any) => b.score - a.score);
        
        // Only use if score is reasonable (above 0.3)
        if (scoredTeams[0].score > 0.3) {
          team = scoredTeams[0].team;
          searchMethod = `broad fuzzy search: "${teamSlug}" (score: ${scoredTeams[0].score.toFixed(2)}, top match: ${scoredTeams[0].team.name})`;
        }
      }
      if (err) error = err;
    }
    
    // Also get some sample teams for debugging
    const { data: sampleTeams } = await supabase
      .from('teams_new')
      .select('id, name')
      .ilike('name', '%kobenhavn%')
      .limit(10);

    return NextResponse.json({
      success: true,
      teamSlug,
      alternativeSearchTerms,
      team,
      searchMethod,
      error: error?.message,
      sampleTeams,
      debug: {
        totalSearchTerms: alternativeSearchTerms.length,
        searchTerms: alternativeSearchTerms
      }
    });

  } catch (error: any) {
    console.error('Test team lookup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 