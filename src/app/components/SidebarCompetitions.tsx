"use client";
import React, { useState, useEffect } from 'react';
import { getPinnedLeagues, togglePinnedLeague, isLeaguePinned } from '../../lib/pinned-leagues';
import LeagueLogo from '../../components/LeagueLogo';
import TeamLogo from '../../components/TeamLogo';
import { slugify } from '../../lib/utils';


export default function SidebarCompetitions({ competitions }: { competitions: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

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
      console.log('No competitions data available, using fallback teams');
      return popularTeamNames.map((name, index) => ({
        id: `fallback-${index}`,
        name: name,
        league: getLeagueForTeam(name),
        team_logo_url: null
      }));
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
    
    // If no popular teams found, create fallback with the specific names
    if (popularTeams.length === 0) {
      console.log('No popular teams found, creating fallback with specific names');
      return popularTeamNames.map((name, index) => ({
        id: `fallback-${index}`,
        name: name,
        league: getLeagueForTeam(name),
        team_logo_url: null
      }));
    }
    
    return popularTeams;
  };
  
  // Helper function to determine league for each team
  function getLeagueForTeam(teamName: string): string {
    if (['Liverpool', 'Manchester United', 'Arsenal', 'Manchester City'].includes(teamName)) {
      return 'Premier League';
    } else if (['Real Madrid', 'Barcelona'].includes(teamName)) {
      return 'La Liga';
    } else if (['Inter', 'Juventus'].includes(teamName)) {
      return 'Serie A';
    }
    return 'Unknown League';
  }

  // Popular teams data - generated from actual competition data
  let popularTeams = generatePopularTeams();
  
  // Temporary fallback if no teams are generated
  if (!popularTeams || popularTeams.length === 0) {
    console.log('Using temporary fallback teams');
    popularTeams = [
      { id: 1, name: 'Liverpool', league: 'Premier League', team_logo_url: null },
      { id: 2, name: 'Manchester United', league: 'Premier League', team_logo_url: null },
      { id: 3, name: 'Arsenal', league: 'Premier League', team_logo_url: null },
      { id: 4, name: 'Manchester City', league: 'Premier League', team_logo_url: null },
      { id: 5, name: 'Real Madrid', league: 'La Liga', team_logo_url: null },
      { id: 6, name: 'Barcelona', league: 'La Liga', team_logo_url: null },
      { id: 7, name: 'Inter', league: 'Serie A', team_logo_url: null },
      { id: 8, name: 'Juventus', league: 'Serie A', team_logo_url: null }
    ];
  }


  // Load pinned leagues on mount and when competitions change
  useEffect(() => {
    setMounted(true);
    updatePinnedLeagues();
  }, [competitions]);


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

  const displayed = showAll ? competitions : competitions.slice(0, 5);

  const handlePinToggle = (league: any) => {
    togglePinnedLeague(league);
    updatePinnedLeagues();
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
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePinToggle(comp);
        }}
        className={`ml-2 p-1 rounded transition-colors ${
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
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
            {team.league}
          </span>
        </div>
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          // TODO: Add team pinning functionality
        }}
        className="ml-2 p-1 rounded transition-colors text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100"
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
    </li>
  );


  // Determine what to show based on pinned leagues
  const hasPinnedLeagues = mounted && pinnedLeagues.length > 0;
  
  // Merge pinned leagues with popular leagues data to get complete information
  const getCompleteLeagueData = (pinnedLeague: any) => {
    const popularLeague = popularLeagues.find(pl => pl.id === pinnedLeague.id);
    return popularLeague || pinnedLeague;
  };
  
  // If we have pinned leagues but no competitions from DB, use pinned leagues with complete data
  const leaguesToShow = hasPinnedLeagues && competitions.length === 0 
    ? pinnedLeagues.map(getCompleteLeagueData)
    : hasPinnedLeagues 
      ? pinnedLeagues.map(getCompleteLeagueData)
      : displayed;

  console.log('=== SIDEBAR RENDER ===');
  console.log('Mounted:', mounted);
  console.log('Has pinned leagues:', hasPinnedLeagues);
  console.log('Pinned leagues count:', pinnedLeagues.length);
  console.log('Leagues to show count:', leaguesToShow.length);
  console.log('Competitions count:', competitions.length);
  console.log('Leagues to show:', JSON.stringify(leaguesToShow.map(c => ({ id: c.id, name: c.name })), null, 2));
  console.log('======================');

  return (
    <aside className="block w-64 bg-white dark:bg-gray-900 h-full min-h-screen">
      <div className="p-4 h-full">
        {/* Popular Leagues Section */}
        <div className="mb-6 pt-2">
          <h2 className="!text-[20px] !font-normal uppercase tracking-wider mb-2 !text-gray-400 dark:!text-gray-500 flex items-center">
            Popular Leagues
          </h2>
          <ul className="space-y-1">
            {popularLeagues.map((comp: any) => renderPopularLeagueItem(comp))}
            
            {/* See All Button - only show when not expanded */}
            {!showAll && (
              <li>
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  See All
                </button>
              </li>
            )}
            
            {/* Additional leagues when expanded */}
            {showAll && competitions.length > 0 && 
              competitions
                .filter((comp: any) => !popularLeagues.some((pl: any) => pl.id === comp.id))
                .map((comp: any) => renderPopularLeagueItem(comp))
            }
            
            {/* Show Less Button - only show when expanded */}
            {showAll && (
              <li>
                <button
                  onClick={() => setShowAll(false)}
                  className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Show Less
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Popular Teams Section */}
        <div className="mb-6">
          <h2 className="!text-[20px] !font-normal uppercase tracking-wider mb-2 !text-gray-400 dark:!text-gray-500 flex items-center">
            Popular Teams
          </h2>
          <ul className="space-y-1">
            {popularTeams.map((team: any) => renderPopularTeamItem(team))}
          </ul>
        </div>
      </div>
    </aside>
  );
} 