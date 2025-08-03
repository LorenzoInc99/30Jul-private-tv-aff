import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

// Your Selected European League IDs (for targeted team fetching)
const EUROPEAN_LEAGUE_IDS = [
  8,   // Premier League (England)
  72,  // Eredivisie (Netherlands)
  82,  // Bundesliga (Germany)
  208, // Pro League (Belgium)
  1371, // UEFA Europa League Play-offs (International)
  271, // Superliga (Denmark)
  301, // Ligue 1 (France)
  384, // Serie A (Italy)
  387, // Serie B (Italy)
  390, // Coppa Italia (Italy)
  462, // Liga Portugal (Portugal)
  564, // La Liga (Spain)
  570, // Copa Del Rey (Spain)
  600, // Super Lig (Turkey)
];

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

async function fetchTeamsByLeagues(leagueIds: number[]) {
  const allTeams: any[] = [];
  const uniqueTeamIds = new Set<number>();
  let totalApiCalls = 0;
  
  console.log(`🎯 Fetching teams from ${leagueIds.length} specific leagues...`);
  
  for (const leagueId of leagueIds) {
    try {
      console.log(`📊 Fetching teams for league ${leagueId}...`);
      
      // Fetch teams for this specific league
      const teams = await fetchAllPages(`https://api.sportmonks.com/v3/football/leagues/${leagueId}/teams`);
      totalApiCalls += Math.ceil(teams.length / 25); // Estimate API calls
      
      console.log(`✅ League ${leagueId}: Found ${teams.length} teams`);
      
      // Add teams to our collection, avoiding duplicates
      for (const team of teams) {
        if (team.id && !uniqueTeamIds.has(team.id)) {
          uniqueTeamIds.add(team.id);
          allTeams.push(team);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error fetching teams for league ${leagueId}:`, error);
      // Continue with other leagues
    }
  }
  
  console.log(`🎯 Total unique teams found: ${allTeams.length} from ${uniqueTeamIds.size} unique team IDs`);
  return { teams: allTeams, apiCalls: totalApiCalls };
}

async function enhanceTeamsWithLogos(teamsData: any[]) {
  const enhancedTeams = [];
  let logosFound = 0;
  let apiCalls = 0;

  console.log(`🔄 Enhancing ${teamsData.length} teams with logos...`);

  for (let i = 0; i < teamsData.length; i++) {
    const team = teamsData[i];
    const teamId = team.id;
    const teamName = team.name || 'Unknown';

    // Show progress every 20 teams (more frequent for smaller dataset)
    if ((i + 1) % 20 === 0) {
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
        apiCalls++;
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

  console.log(`✅ Enhanced ${enhancedTeams.length} teams with ${logosFound} logos found`);
  return { enhancedTeams, apiCalls };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let totalApiCalls = 0;
  
  try {
    console.log('🔄 Starting optimized teams update (league-specific)...');
    
    const supabase = supabaseServer();
    if (!supabase) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // Fetch teams only from specific leagues
    const { teams: teamsData, apiCalls: leagueApiCalls } = await fetchTeamsByLeagues(EUROPEAN_LEAGUE_IDS);
    totalApiCalls += leagueApiCalls;
    
    if (teamsData.length === 0) {
      throw new Error('No teams found from the specified leagues');
    }
    
    // Enhance teams with logos
    const { enhancedTeams, apiCalls: logoApiCalls } = await enhanceTeamsWithLogos(teamsData);
    totalApiCalls += logoApiCalls;
    
    // Save to database
    const { error } = await supabase
      .from('teams_new')
      .upsert(enhancedTeams, { onConflict: 'id' });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${enhancedTeams.length} teams from ${EUROPEAN_LEAGUE_IDS.length} leagues`,
      apiCalls: totalApiCalls,
      duration,
      timestamp: new Date().toISOString(),
      details: {
        leaguesProcessed: EUROPEAN_LEAGUE_IDS.length,
        teamsUpdated: enhancedTeams.length,
        teamsWithLogos: enhancedTeams.filter(t => t.team_logo_url).length,
        leagueApiCalls,
        logoApiCalls
      }
    });
    
  } catch (error) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      apiCalls: totalApiCalls,
      duration,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 