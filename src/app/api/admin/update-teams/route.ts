import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

async function fetchFromSportMonks(url: string, params: Record<string, any> = {}) {
  if (!SPORTMONKS_API_TOKEN) {
    throw new Error('SPORTMONKS_API_TOKEN is not configured');
  }

  const fullParams = { api_token: SPORTMONKS_API_TOKEN, ...params };
  const queryString = new URLSearchParams(fullParams).toString();
  const fullUrl = `${url}?${queryString}`;
  
  const response = await fetch(fullUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  
  return await response.json();
}

async function fetchAllPages(url: string, params: Record<string, any> = {}) {
  const allData: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetchFromSportMonks(url, { ...params, page });
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        allData.push(...response.data);
      } else {
        allData.push(response.data);
      }
    }
    
    hasMore = response.pagination?.has_more || false;
    page++;
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return allData;
}

async function enhanceTeamsWithLogos(teamsData: any[]) {
  const enhancedTeams = [];
  let logosFound = 0;

  for (let i = 0; i < teamsData.length; i++) {
    const team = teamsData[i];
    const teamId = team.id;
    const teamName = team.name || 'Unknown';

    // Show progress every 50 teams
    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${teamsData.length} teams processed`);
    }

    // Try to get logo URL from the team data first
    let logoUrl = null;
    const logoFields = ['image_path', 'logo_path', 'team_logo_url', 'logo_url'];

    for (const field of logoFields) {
      if (field in team && team[field]) {
        const potentialLogo = team[field];
        if (potentialLogo && 
            potentialLogo.startsWith('http') && 
            !potentialLogo.toLowerCase().includes('placeholder')) {
          logoUrl = potentialLogo;
          break;
        }
      }
    }

    // If no logo found in team data, fetch individual team details
    if (!logoUrl) {
      try {
        const teamDetailResponse = await fetchFromSportMonks(
          `https://api.sportmonks.com/v3/football/teams/${teamId}`
        );

        if (teamDetailResponse.data) {
          const teamDetail = teamDetailResponse.data;

          // Look for logo in team detail
          for (const field of logoFields) {
            if (field in teamDetail && teamDetail[field]) {
              const potentialLogo = teamDetail[field];
              if (potentialLogo && 
                  potentialLogo.startsWith('http') && 
                  !potentialLogo.toLowerCase().includes('placeholder')) {
                logoUrl = potentialLogo;
                break;
              }
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        // Silently continue if logo fetch fails
        console.error(`Error fetching logo for team ${teamId}:`, error);
      }
    }

    // Create enhanced team data
    const enhancedTeam = {
      id: team.id,
      name: team.name,
      short_code: team.short_code,
      country_id: team.country_id,
      venue_id: team.venue_id,
      team_logo_url: logoUrl
    };

    enhancedTeams.push(enhancedTeam);

    if (logoUrl) {
      logosFound++;
    }
  }

  console.log(`Enhanced ${enhancedTeams.length} teams with ${logosFound} logos found`);
  return enhancedTeams;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    apiCalls++;
    const teamsData = await fetchAllPages('https://api.sportmonks.com/v3/football/teams');
    
    // Enhance teams with logos
    const enhancedTeams = await enhanceTeamsWithLogos(teamsData);
    
    const { error } = await supabase
      .from('teams_new')
      .upsert(enhancedTeams, { onConflict: 'id' });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${enhancedTeams.length} teams`,
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        teamsUpdated: enhancedTeams.length,
        teamsWithLogos: enhancedTeams.filter(t => t.team_logo_url).length
      }
    });
    
  } catch (error) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      apiCalls,
      duration,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 