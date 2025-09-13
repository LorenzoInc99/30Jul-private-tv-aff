"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getPinnedLeagues, togglePinnedLeague, isLeaguePinned } from '../../lib/pinned-leagues';
import LeagueLogo from '../../components/LeagueLogo';
import TeamLogo from '../../components/TeamLogo';
import { slugify } from '../../lib/utils';
import { useSidebar } from '../../contexts/SidebarContext';


export default function SidebarCompetitions({ competitions }: { competitions: any[] }) {
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Use global sidebar context
  const {
    customLeagues,
    customTeams,
    hiddenLeagues,
    hiddenTeams,
    addCustomLeague,
    addCustomTeam,
    hideLeague,
    hideTeam,
    isLeagueInSidebar,
    isTeamInSidebar
  } = useSidebar();

  // Popular leagues data
  const popularLeagues = [
    { id: 8, name: 'Premier League', country: 'England', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/8.png' },
    { id: 564, name: 'La Liga', country: 'Spain', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/564.png' },
    { id: 82, name: 'Bundesliga', country: 'Germany', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/82.png' },
    { id: 384, name: 'Serie A', country: 'Italy', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/384.png' },
    { id: 301, name: 'Ligue 1', country: 'France', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/301.png' }
  ];

  // Generate popular teams from actual competition data
  const generatePopularTeams = () => {
    // Define the specific popular teams you want to show
    const popularTeamNames = [
      'Liverpool',
      'Manchester United', 
      'Arsenal',
      'Manchester City',
      'Real Madrid',
      'Barcelona',
      'Inter',
      'Juventus'
    ];
    
    if (!competitions || competitions.length === 0) {
      console.log('No competitions data available');
      return [];
    }
    
    console.log('Generating popular teams from competitions:', competitions);
    
    const allTeams = new Map();
    
    // Extract teams from all competitions - try different data structures
    competitions.forEach((comp, compIndex) => {
      // Try different possible data structures
      let matches = comp.matches || comp.Events || comp.fixtures || [];
      
      if (matches.length > 0) {
        console.log(`  Found ${matches.length} matches in competition ${compIndex}`);
        
        matches.forEach((match: any) => {
          // Add home team - try different possible logo field names
          if (match.home_team && match.home_team.name) {
            const logoUrl = match.home_team.team_logo_url || match.home_team.logo_url || match.home_team.image_path || match.home_team.team_logo;
            if (logoUrl) {
              allTeams.set(match.home_team.id, {
                id: match.home_team.id,
                name: match.home_team.name,
                league: comp.name,
                team_logo_url: logoUrl
              });
            }
          }
          
          // Add away team - try different possible logo field names
          if (match.away_team && match.away_team.name) {
            const logoUrl = match.away_team.team_logo_url || match.away_team.logo_url || match.away_team.image_path || match.away_team.team_logo;
            if (logoUrl) {
              allTeams.set(match.away_team.id, {
                id: match.away_team.id,
                name: match.away_team.name,
                league: comp.name,
                team_logo_url: logoUrl
              });
            }
          }
        });
      }
    });
    
    // Filter to only include the specific popular teams
    const popularTeams = Array.from(allTeams.values())
      .filter(team => popularTeamNames.includes(team.name))
      .sort((a, b) => popularTeamNames.indexOf(a.name) - popularTeamNames.indexOf(b.name));
    
    console.log('Popular teams found:', popularTeams.length);
    
    // If no popular teams found, return empty array
    if (popularTeams.length === 0) {
      console.log('No popular teams found in database');
      return [];
    }
    
    return popularTeams;
  };
  
  // Helper function to determine country for each team
  function getCountryForTeam(teamName: string): string {
    if (['Liverpool', 'Manchester United', 'Arsenal', 'Manchester City'].includes(teamName)) {
      return 'England';
    } else if (['Real Madrid', 'Barcelona'].includes(teamName)) {
      return 'Spain';
    } else if (['Inter', 'Juventus'].includes(teamName)) {
      return 'Italy';
    }
    return 'Unknown';
  }

  // Popular teams data - generated from actual competition data
  let popularTeams = generatePopularTeams();
  
  // Temporary fallback if no teams are generated
  if (!popularTeams || popularTeams.length === 0) {
    console.log('Using temporary fallback teams');
    popularTeams = [
      { id: 1, name: 'Liverpool', country: 'England', team_logo_url: null },
      { id: 2, name: 'Manchester United', country: 'England', team_logo_url: null },
      { id: 3, name: 'Arsenal', country: 'England', team_logo_url: null },
      { id: 4, name: 'Manchester City', country: 'England', team_logo_url: null },
      { id: 5, name: 'Real Madrid', country: 'Spain', team_logo_url: null },
      { id: 6, name: 'Barcelona', country: 'Spain', team_logo_url: null },
      { id: 7, name: 'Inter', country: 'Italy', team_logo_url: null },
      { id: 8, name: 'Juventus', country: 'Italy', team_logo_url: null }
    ];
  }


  // Load pinned leagues on mount and when competitions change
  useEffect(() => {
    setMounted(true);
    updatePinnedLeagues();
  }, [competitions]);


  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedSearchQuery]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && searchResultsRef.current) {
      const selectedElement = searchResultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchResults]);


  // Listen for pinned league changes from other components
  useEffect(() => {
    const handlePinnedLeaguesChange = () => {
      updatePinnedLeagues();
    };

    window.addEventListener('pinnedLeaguesChanged', handlePinnedLeaguesChange);
    return () => {
      window.removeEventListener('pinnedLeaguesChanged', handlePinnedLeaguesChange);
    };
  }, []);

  const updatePinnedLeagues = () => {
    const pinned = getPinnedLeagues();
    // Directly use the pinned leagues from localStorage, don't filter against competitions
    setPinnedLeagues(pinned);
    
    console.log('=== SIDEBAR DEBUG ===');
    console.log('Competitions count:', competitions.length);
    console.log('Competitions:', JSON.stringify(competitions.map(c => ({ id: c.id, name: c.name })), null, 2));
    console.log('Pinned from storage:', JSON.stringify(pinned, null, 2));
    console.log('Pinned leagues count (direct from storage):', pinned.length);
    console.log('====================');
  };

  const handlePinToggle = (league: any) => {
    togglePinnedLeague(league);
    updatePinnedLeagues();
  };

  const handleHideLeague = (leagueId: number) => {
    hideLeague(leagueId);
  };

  const handleHideTeam = (teamId: string) => {
    hideTeam(teamId);
  };

  // Search functionality
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
    setSelectedIndex(-1); // Reset selection when typing
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const searchResults = getSearchResults();
    const allResults = [...searchResults.leagues, ...searchResults.teams];
    
    if (!showSearchResults || allResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allResults.length) {
          const selectedItem = allResults[selectedIndex];
          if (selectedIndex < searchResults.leagues.length) {
            // It's a league
            handleAddLeague(selectedItem);
          } else {
            // It's a team
            handleAddTeam(selectedItem);
          }
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleAddLeague = (league: any) => {
    addCustomLeague(league);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleAddTeam = (team: any) => {
    addCustomTeam(team);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Get all available leagues for search (uses existing competitions data)
  const getAllAvailableLeagues = () => {
    const allLeagues: any[] = [];
    if (competitions && competitions.length > 0) {
      competitions.forEach(comp => {
        if (!allLeagues.some(league => league.id === comp.id)) {
          
          allLeagues.push({
            id: comp.id,
            name: comp.name,
            country: comp.country?.name || 'Unknown',
            league_logo: comp.league_logo || comp.logo_url
          });
        }
      });
    }
    return allLeagues;
  };

  // Get all available teams for search (extracts teams from fixtures)
  const getAllAvailableTeams = () => {
    const allTeams = new Map();
    
    if (competitions && competitions.length > 0) {
      competitions.forEach(comp => {
        // Extract teams from fixtures (home_team and away_team)
        if (comp.fixtures && Array.isArray(comp.fixtures)) {
          comp.fixtures.forEach((fixture: any) => {
            // Add home team
            if (fixture.home_team && fixture.home_team.id) {
              if (!allTeams.has(fixture.home_team.id)) {
                allTeams.set(fixture.home_team.id, {
                  id: fixture.home_team.id,
                  name: fixture.home_team.name,
                  country: comp.country?.name || 'Unknown',
                  team_logo_url: fixture.home_team.team_logo_url
                });
              }
            }
            
            // Add away team
            if (fixture.away_team && fixture.away_team.id) {
              if (!allTeams.has(fixture.away_team.id)) {
                allTeams.set(fixture.away_team.id, {
                  id: fixture.away_team.id,
                  name: fixture.away_team.name,
                  country: comp.country?.name || 'Unknown',
                  team_logo_url: fixture.away_team.team_logo_url
                });
              }
            }
          });
        }
      });
    }
    
    const teamsArray = Array.from(allTeams.values());
    console.log('Available teams for search:', teamsArray.length, teamsArray.slice(0, 5));
    console.log('Sample team with country data:', teamsArray[0]);
    return teamsArray;
  };

  // Filter search results (now uses debounced query for better performance)
  const getSearchResults = () => {
    if (!debouncedSearchQuery.trim()) return { leagues: [], teams: [] };
    
    const query = debouncedSearchQuery.toLowerCase();
    const allLeagues = getAllAvailableLeagues();
    const allTeams = getAllAvailableTeams();
    
    const filteredLeagues = allLeagues.filter(league => 
      league.name.toLowerCase().includes(query)
    ).slice(0, 5);
    
    const filteredTeams = allTeams.filter(team => 
      team.name.toLowerCase().includes(query)
    ).slice(0, 5);
    
    console.log('Search query:', query, 'Found teams:', filteredTeams.length, filteredTeams);
    
    return { leagues: filteredLeagues, teams: filteredTeams };
  };





  const renderPopularLeagueItem = (comp: any) => (
    <li key={comp.id} className="flex items-center justify-between group">
      <a
        href={`/competition/${comp.id}-${comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
        className="flex-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm py-1 flex items-center"
      >
        <LeagueLogo 
          logoUrl={comp.league_logo} 
          leagueName={comp.name} 
          leagueId={comp.id}
          size="md" 
          className="mr-3 flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-medium">{comp.name}</span>
          {comp.country && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
              {comp.country}
            </span>
          )}
        </div>
      </a>
      <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePinToggle(comp);
        }}
          className={`p-1 rounded transition-colors ${
          isLeaguePinned(comp.id)
            ? 'text-yellow-500 hover:text-yellow-600' 
            : 'text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
        }`}
        title={isLeaguePinned(comp.id) ? 'Unpin league' : 'Pin league'}
        aria-label={isLeaguePinned(comp.id) ? 'Unpin league' : 'Pin league'}
      >
        <svg 
          className="w-4 h-4" 
          fill={isLeaguePinned(comp.id) ? "currentColor" : "none"} 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleHideLeague(comp.id);
          }}
          className="p-1 rounded transition-colors text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-0 focus:border-0"
          title="Remove league"
          aria-label="Remove league"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M20 12H4" 
            />
          </svg>
        </button>
      </div>
    </li>
  );

  const renderPopularTeamItem = (team: any) => (
    <li key={team.id} className="flex items-center justify-between group">
      <a
        href={`/team/${slugify(team.name)}`}
        className="flex-1 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors md:text-sm py-1 flex items-center"
      >
        <TeamLogo 
          logoUrl={team.team_logo_url} 
          teamName={team.name} 
          size="md" 
          className="mr-3 flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-medium">{team.name}</span>
          {team.country && team.country !== 'Unknown' && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
              {team.country}
          </span>
          )}
        </div>
      </a>
      <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          // TODO: Add team pinning functionality
        }}
          className="p-1 rounded transition-colors text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100"
        title="Pin team"
        aria-label="Pin team"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleHideTeam(team.id);
          }}
          className="p-1 rounded transition-colors text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-0 focus:border-0"
          title="Remove team"
          aria-label="Remove team"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M20 12H4" 
            />
          </svg>
        </button>
      </div>
    </li>
  );


  // Determine what to show based on pinned leagues
  const hasPinnedLeagues = mounted && pinnedLeagues.length > 0;
  
  // Get leagues from database (for search only)
  const databaseLeagues = getAllAvailableLeagues();
  
  // Merge pinned leagues with database leagues data to get complete information
  const getCompleteLeagueData = (pinnedLeague: any) => {
    const databaseLeague = databaseLeagues.find(pl => pl.id === pinnedLeague.id);
    return databaseLeague || pinnedLeague;
  };
  
  // Only show custom teams that user has added
  const allTeamsToShow = customTeams;

  console.log('=== SIDEBAR RENDER ===');
  console.log('Mounted:', mounted);
  console.log('Custom leagues count:', customLeagues.length);
  console.log('Custom teams count:', customTeams.length);
  console.log('======================');

  const searchResults = getSearchResults();

  return (
    <aside className="block w-64 bg-white dark:bg-gray-900 h-full min-h-screen">
      <div className="p-4 h-full">
        {/* Search Interface */}
        <div className="mb-6 relative search-container">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leagues and teams..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-0"
            />
            <svg 
              className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (searchResults.leagues.length > 0 || searchResults.teams.length > 0) && (
            <div 
              ref={searchResultsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            >
              {/* League Results */}
              {searchResults.leagues.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Leagues
                  </div>
                  {searchResults.leagues.map((league: any, index: number) => {
                    const isAlreadyAdded = isLeagueInSidebar(league.id);
                    const isSelected = selectedIndex === index;
                    return (
                      <div 
                        key={league.id} 
                        data-index={index}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          isSelected 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center flex-1">
                          <LeagueLogo 
                            logoUrl={league.league_logo} 
                            leagueName={league.name} 
                            leagueId={league.id}
                            size="sm" 
                            className="mr-2 flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{league.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{league.country}</span>
          </div>
        </div>
                        {!isAlreadyAdded && (
                <button
                            onClick={() => handleAddLeague(league)}
                            className="ml-2 p-1 rounded transition-colors text-gray-400 hover:text-green-500 focus:outline-none focus:ring-0 focus:border-0"
                            title="Add league"
                            aria-label="Add league"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Team Results */}
              {searchResults.teams.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Teams
                  </div>
                  {searchResults.teams.map((team: any, index: number) => {
                    const isAlreadyAdded = isTeamInSidebar(team.id);
                    const teamIndex = searchResults.leagues.length + index; // Adjust index for combined results
                    const isSelected = selectedIndex === teamIndex;
                    return (
                      <div 
                        key={team.id} 
                        data-index={teamIndex}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          isSelected 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center flex-1">
                          <TeamLogo 
                            logoUrl={team.team_logo_url} 
                            teamName={team.name} 
                            size="sm" 
                            className="mr-2 flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{team.name}</span>
                            {team.country && team.country !== 'Unknown' && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{team.country}</span>
                            )}
                          </div>
                        </div>
                        {!isAlreadyAdded && (
                <button
                            onClick={() => handleAddTeam(team)}
                            className="ml-2 p-1 rounded transition-colors text-gray-400 hover:text-green-500 focus:outline-none focus:ring-0 focus:border-0"
                            title="Add team"
                            aria-label="Add team"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Leagues Section */}
        <div className="mb-6 pt-2">
          <h2 className="!text-[20px] !font-normal uppercase tracking-wider mb-2 !text-gray-400 dark:!text-gray-500 flex items-center">
            My Leagues
          </h2>
          <ul className="space-y-1">
            {customLeagues.filter((comp: any) => !hiddenLeagues.has(comp.id)).map((comp: any) => renderPopularLeagueItem(comp))}
          </ul>
        </div>

        {/* Custom Teams Section */}
        <div className="mb-6">
          <h2 className="!text-[20px] !font-normal uppercase tracking-wider mb-2 !text-gray-400 dark:!text-gray-500 flex items-center">
            My Teams
          </h2>
          <ul className="space-y-1">
            {customTeams.filter((team: any) => !hiddenTeams.has(team.id)).map((team: any) => renderPopularTeamItem(team))}
          </ul>
        </div>
      </div>
    </aside>
  );
} 