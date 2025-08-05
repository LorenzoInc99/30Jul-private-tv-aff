import { NextRequest, NextResponse } from 'next/server';
import { insertData } from '@/lib/database';

interface StaticDataConfig {
  includeCountries?: boolean;
  includeLeagues?: boolean;
  includeTeams?: boolean;
  includeBookmakers?: boolean;
  includeTvStations?: boolean;
  targetLeagueIds?: number[];
  includeTeamLogos?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiCalls = 0;
  const logs: string[] = [];

  try {
    console.log('API route called');
    const body = await request.json();
    console.log('Request body:', body);
    const config: StaticDataConfig = {
      includeCountries: body.includeCountries !== false,
      includeLeagues: body.includeLeagues !== false,
      includeTeams: body.includeTeams !== false,
      includeBookmakers: body.includeBookmakers !== false,
      includeTvStations: body.includeTvStations !== false,
      targetLeagueIds: [
        8,   // Premier League (England)
        9,   // Championship (England)
        24,  // League One (England)
        27,  // League Two (England)
        72,  // Eredivisie (Netherlands)
        82,  // Bundesliga (Germany)
        208, // Pro League (Belgium)
        1371, // UEFA Europa League Play-offs
        271, // Superliga (Denmark)
        301, // Ligue 1 (France)
        384, // Serie A (Italy)
        387, // Serie B (Italy)
        390, // Coppa Italia (Italy)
        444, // Norway
        462, // Liga Portugal (Portugal)
        501, // Scotland
        564, // La Liga (Spain)
        570, // Copa Del Rey (Spain)
        573, // Spain
        591, // Spain
        600, // Super Lig (Turkey)
      ],
      includeTeamLogos: body.includeTeamLogos !== false,
      ...body
    };

    logs.push(`Starting static data fetch with config: ${JSON.stringify(config)}`);

    const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
    if (!API_TOKEN) {
      throw new Error('SPORTMONKS_API_TOKEN not configured');
    }

    const results: any = {};

    // Fetch Countries
    if (config.includeCountries) {
      logs.push('Fetching countries...');
      const countries = await fetchCountries(API_TOKEN, logs);
      apiCalls += countries.apiCalls;
      results.countries = countries.data;
      logs.push(`✅ Countries: ${countries.data.length} fetched`);
    }

    // Fetch Leagues
    if (config.includeLeagues) {
      logs.push('Fetching leagues...');
      const leagues = await fetchLeagues(API_TOKEN, logs);
      apiCalls += leagues.apiCalls;
      results.leagues = leagues.data;
      logs.push(`✅ Leagues: ${leagues.data.length} fetched`);
    }

    // Fetch Teams
    if (config.includeTeams) {
      logs.push('Fetching teams...');
      const teams = await fetchTeams(API_TOKEN, config.includeTeamLogos, logs);
      apiCalls += teams.apiCalls;
      results.teams = teams.data;
      logs.push(`✅ Teams: ${teams.data.length} fetched`);
    }

    // Fetch Bookmakers
    if (config.includeBookmakers) {
      logs.push('Fetching bookmakers...');
      const bookmakers = await fetchBookmakers(API_TOKEN, logs);
      apiCalls += bookmakers.apiCalls;
      results.bookmakers = bookmakers.data;
      logs.push(`✅ Bookmakers: ${bookmakers.data.length} fetched`);
    }

    // Fetch TV Stations
    if (config.includeTvStations) {
      logs.push('Fetching TV stations...');
      const tvStations = await fetchTvStations(API_TOKEN, logs);
      apiCalls += tvStations.apiCalls;
      results.tvStations = tvStations.data;
      logs.push(`✅ TV Stations: ${tvStations.data.length} fetched`);
    }

    // Save to database
    logs.push('Saving data to database...');
    await saveToDatabase(results, logs);

    const duration = Date.now() - startTime;
    logs.push(`✅ Static data fetch completed in ${duration}ms with ${apiCalls} API calls`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      apiCalls,
      logs,
      results: {
        countries: results.countries?.length || 0,
        leagues: results.leagues?.length || 0,
        teams: results.teams?.length || 0,
        bookmakers: results.bookmakers?.length || 0,
        tvStations: results.tvStations?.length || 0,
      }
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ Error: ${error.message}`);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      apiCalls,
      logs
    }, { status: 500 });
  }
}

async function fetchCountries(apiToken: string, logs: string[]) {
  const url = 'https://api.sportmonks.com/v3/football/leagues';
  const params = {
    api_token: apiToken,
    include: 'country',
    per_page: 100,
    order: 'name:asc'
  };

  const allCountries = new Map();
  let page = 1;
  let apiCalls = 0;
  let hasMore = true;
  const maxPages = 50;

  while (hasMore && page <= maxPages) {
    try {
      const currentParams = { ...params, page };
      const response = await fetch(`${url}?${new URLSearchParams(currentParams)}`);
      apiCalls++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data) {
        const leagues = data.data;
        for (const league of leagues) {
          if (league.country) {
            const country = league.country;
            if (!allCountries.has(country.id)) {
              allCountries.set(country.id, {
                id: country.id,
                name: country.name,
                image_path: country.image_path
              });
            }
          }
        }
      }

      if (data.pagination) {
        hasMore = data.pagination.has_more || false;
        page++;
      } else {
        hasMore = false;
      }

      logs.push(`  Countries page ${page - 1}: ${allCountries.size} unique countries found`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      logs.push(`  Error fetching countries page ${page}: ${error.message}`);
      break;
    }
  }

  return {
    data: Array.from(allCountries.values()),
    apiCalls
  };
}

async function fetchLeagues(apiToken: string, logs: string[]) {
  const url = 'https://api.sportmonks.com/v3/football/leagues';
  const params = {
    api_token: apiToken,
    per_page: 100,
    order: 'name:asc'
  };

  const allLeagues = [];
  let page = 1;
  let apiCalls = 0;
  let hasMore = true;
  const maxPages = 50;

  while (hasMore && page <= maxPages) {
    try {
      const currentParams = { ...params, page };
      const response = await fetch(`${url}?${new URLSearchParams(currentParams)}`);
      apiCalls++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data) {
        allLeagues.push(...data.data);
      }

      if (data.pagination) {
        hasMore = data.pagination.has_more || false;
        page++;
      } else {
        hasMore = false;
      }

      logs.push(`  Leagues page ${page - 1}: ${data.data?.length || 0} leagues`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      logs.push(`  Error fetching leagues page ${page}: ${error.message}`);
      break;
    }
  }

  return {
    data: allLeagues,
    apiCalls
  };
}

async function fetchTeams(apiToken: string, includeLogos: boolean, logs: string[]) {
  const url = 'https://api.sportmonks.com/v3/football/teams';
  const params = {
    api_token: apiToken,
    per_page: 100,
    order: 'name:asc'
  };

  const allTeams = [];
  let page = 1;
  let apiCalls = 0;
  let hasMore = true;
  const maxPages = 100; // More pages for teams

  while (hasMore && page <= maxPages) {
    try {
      const currentParams = { ...params, page };
      const response = await fetch(`${url}?${new URLSearchParams(currentParams)}`);
      apiCalls++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data) {
        allTeams.push(...data.data);
      }

      if (data.pagination) {
        hasMore = data.pagination.has_more || false;
        page++;
      } else {
        hasMore = false;
      }

      logs.push(`  Teams page ${page - 1}: ${data.data?.length || 0} teams`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      logs.push(`  Error fetching teams page ${page}: ${error.message}`);
      break;
    }
  }

  // Enhance teams with logos if requested
  if (includeLogos) {
    logs.push('Enhancing teams with logo URLs...');
    const enhancedTeams = await enhanceTeamsWithLogos(apiToken, allTeams, logs);
    apiCalls += enhancedTeams.apiCalls;
    return {
      data: enhancedTeams.data,
      apiCalls
    };
  }

  return {
    data: allTeams,
    apiCalls
  };
}

async function enhanceTeamsWithLogos(apiToken: string, teams: any[], logs: string[]) {
  const enhancedTeams = [];
  let apiCalls = 0;
  let logosFound = 0;

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const teamId = team.id;
    const teamName = team.name;

    // Show progress every 50 teams
    if ((i + 1) % 50 === 0) {
      logs.push(`  Logo enhancement progress: ${i + 1}/${teams.length} teams`);
    }

    // Try to get logo URL from the team data first
    let logoUrl = null;
    const logoFields = ['image_path', 'logo_path', 'team_logo_url', 'logo_url'];

    for (const field of logoFields) {
      if (team[field]) {
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
        const url = `https://api.sportmonks.com/v3/football/teams/${teamId}`;
        const params = { api_token: apiToken };
        const response = await fetch(`${url}?${new URLSearchParams(params)}`);
        apiCalls++;

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            const teamDetail = data.data;

            // Look for logo in team detail
            for (const field of logoFields) {
              if (teamDetail[field]) {
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
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        // Silently continue if logo fetch fails
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

  logs.push(`  Enhanced ${enhancedTeams.length} teams with ${logosFound} logos found`);
  
  return {
    data: enhancedTeams,
    apiCalls
  };
}

async function fetchBookmakers(apiToken: string, logs: string[]) {
  const url = 'https://api.sportmonks.com/v3/odds/bookmakers';
  const params = {
    api_token: apiToken,
    per_page: 100,
    order: 'name:asc'
  };

  const allBookmakers = [];
  let page = 1;
  let apiCalls = 0;
  let hasMore = true;
  const maxPages = 20;

  while (hasMore && page <= maxPages) {
    try {
      const currentParams = { ...params, page };
      const response = await fetch(`${url}?${new URLSearchParams(currentParams)}`);
      apiCalls++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data) {
        allBookmakers.push(...data.data);
      }

      if (data.pagination) {
        hasMore = data.pagination.has_more || false;
        page++;
      } else {
        hasMore = false;
      }

      logs.push(`  Bookmakers page ${page - 1}: ${data.data?.length || 0} bookmakers`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      logs.push(`  Error fetching bookmakers page ${page}: ${error.message}`);
      break;
    }
  }

  return {
    data: allBookmakers,
    apiCalls
  };
}

async function fetchTvStations(apiToken: string, logs: string[]) {
  const url = 'https://api.sportmonks.com/v3/football/tv-stations';
  const params = {
    api_token: apiToken,
    per_page: 100,
    order: 'name:asc'
  };

  const allTvStations = [];
  let page = 1;
  let apiCalls = 0;
  let hasMore = true;
  const maxPages = 20;

  while (hasMore && page <= maxPages) {
    try {
      const currentParams = { ...params, page };
      const response = await fetch(`${url}?${new URLSearchParams(currentParams)}`);
      apiCalls++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data) {
        allTvStations.push(...data.data);
      }

      if (data.pagination) {
        hasMore = data.pagination.has_more || false;
        page++;
      } else {
        hasMore = false;
      }

      logs.push(`  TV Stations page ${page - 1}: ${data.data?.length || 0} stations`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      logs.push(`  Error fetching TV stations page ${page}: ${error.message}`);
      break;
    }
  }

  return {
    data: allTvStations,
    apiCalls
  };
}

async function saveToDatabase(results: any, logs: string[]) {
  try {
    // Save countries
    if (results.countries?.length) {
      const result = await insertData('countries', results.countries);
      if (!result.success) throw new Error(result.error);
      logs.push(`  Saved ${results.countries.length} countries to database`);
    }

    // Save leagues
    if (results.leagues?.length) {
      const result = await insertData('leagues', results.leagues);
      if (!result.success) throw new Error(result.error);
      logs.push(`  Saved ${results.leagues.length} leagues to database`);
    }

    // Save teams
    if (results.teams?.length) {
      const result = await insertData('teams_new', results.teams);
      if (!result.success) throw new Error(result.error);
      logs.push(`  Saved ${results.teams.length} teams to database`);
    }

    // Save bookmakers
    if (results.bookmakers?.length) {
      const result = await insertData('bookmakers', results.bookmakers);
      if (!result.success) throw new Error(result.error);
      logs.push(`  Saved ${results.bookmakers.length} bookmakers to database`);
    }

    // Save TV stations
    if (results.tvStations?.length) {
      const result = await insertData('tvstations', results.tvStations);
      if (!result.success) throw new Error(result.error);
      logs.push(`  Saved ${results.tvStations.length} TV stations to database`);
    }

    logs.push('✅ All data saved to database successfully');

  } catch (error: any) {
    logs.push(`❌ Database error: ${error.message}`);
    throw error;
  }
} 