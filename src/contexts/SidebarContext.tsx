'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  customLeagues: any[];
  customTeams: any[];
  hiddenLeagues: Set<number>;
  hiddenTeams: Set<string>;
  addCustomLeague: (league: any) => void;
  addCustomTeam: (team: any) => void;
  hideLeague: (leagueId: number) => void;
  hideTeam: (teamId: string) => void;
  isLeagueHidden: (leagueId: number) => boolean;
  isTeamHidden: (teamId: string) => boolean;
  isLeagueInSidebar: (leagueId: number) => boolean;
  isTeamInSidebar: (teamId: string) => boolean;
  resetToDefaults: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [customLeagues, setCustomLeagues] = useState<any[]>([]);
  const [customTeams, setCustomTeams] = useState<any[]>([]);
  const [hiddenLeagues, setHiddenLeagues] = useState<Set<number>>(new Set());
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(new Set());

  // Default leagues and teams for new users
  const defaultLeagues = [
    { id: 8, name: 'Premier League', country: 'England', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/8.png' },
    { id: 564, name: 'La Liga', country: 'Spain', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/564.png' },
    { id: 82, name: 'Bundesliga', country: 'Germany', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/82.png' },
    { id: 384, name: 'Serie A', country: 'Italy', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/384.png' },
    { id: 301, name: 'Ligue 1', country: 'France', league_logo: 'https://cdn.sportmonks.com/images/soccer/leagues/301.png' }
  ];

  const defaultTeams = [
    // No default teams - let users add them through search
    // This prevents logo issues and ensures teams are properly loaded from database
  ];

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCustomLeagues = localStorage.getItem('sidebar-custom-leagues');
      const savedCustomTeams = localStorage.getItem('sidebar-custom-teams');
      const savedHiddenLeagues = localStorage.getItem('sidebar-hidden-leagues');
      const savedHiddenTeams = localStorage.getItem('sidebar-hidden-teams');
      const hasInitialized = localStorage.getItem('sidebar-initialized');

      // Initialize with defaults for new users
      if (!hasInitialized) {
        setCustomLeagues(defaultLeagues);
        setCustomTeams(defaultTeams);
        localStorage.setItem('sidebar-initialized', 'true');
        localStorage.setItem('sidebar-custom-leagues', JSON.stringify(defaultLeagues));
        localStorage.setItem('sidebar-custom-teams', JSON.stringify(defaultTeams));
      } else {
        // Load existing data but clear teams if they have wrong logos
        if (savedCustomLeagues) {
          try {
            setCustomLeagues(JSON.parse(savedCustomLeagues));
          } catch (e) {
            console.error('Error parsing custom leagues:', e);
          }
        }

        if (savedCustomTeams) {
          try {
            const teams = JSON.parse(savedCustomTeams);
            // Check if teams have wrong data (like Liverpool with West Ham logo)
            const hasWrongLogos = teams.some((team: any) => 
              team.name === 'Liverpool' && team.team_logo_url && 
              (team.team_logo_url.includes('west-ham') || team.team_logo_url.includes('hammers'))
            );
            
            if (hasWrongLogos) {
              console.log('Detected wrong logos, clearing teams');
              setCustomTeams([]);
              localStorage.setItem('sidebar-custom-teams', JSON.stringify([]));
            } else {
              setCustomTeams(teams);
            }
          } catch (e) {
            console.error('Error parsing custom teams:', e);
            setCustomTeams([]);
          }
        }
      }

      if (savedHiddenLeagues) {
        try {
          const hiddenLeaguesArray = JSON.parse(savedHiddenLeagues);
          setHiddenLeagues(new Set(hiddenLeaguesArray));
        } catch (e) {
          console.error('Error parsing hidden leagues:', e);
        }
      }

      if (savedHiddenTeams) {
        try {
          const hiddenTeamsArray = JSON.parse(savedHiddenTeams);
          setHiddenTeams(new Set(hiddenTeamsArray));
        } catch (e) {
          console.error('Error parsing hidden teams:', e);
        }
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-custom-leagues', JSON.stringify(customLeagues));
    }
  }, [customLeagues]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-custom-teams', JSON.stringify(customTeams));
    }
  }, [customTeams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-hidden-leagues', JSON.stringify(Array.from(hiddenLeagues)));
    }
  }, [hiddenLeagues]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-hidden-teams', JSON.stringify(Array.from(hiddenTeams)));
    }
  }, [hiddenTeams]);

  const addCustomLeague = (league: any) => {
    setCustomLeagues(prev => {
      // Check if league already exists
      if (prev.some(l => l.id === league.id)) {
        return prev;
      }
      return [...prev, league];
    });
    // Remove from hidden leagues when adding
    setHiddenLeagues(prev => {
      const newSet = new Set(prev);
      newSet.delete(league.id);
      return newSet;
    });
  };

  const addCustomTeam = (team: any) => {
    setCustomTeams(prev => {
      // Check if team already exists
      if (prev.some(t => t.id === team.id)) {
        return prev;
      }
      return [...prev, team];
    });
    // Remove from hidden teams when adding
    setHiddenTeams(prev => {
      const newSet = new Set(prev);
      newSet.delete(team.id);
      return newSet;
    });
  };

  const hideLeague = (leagueId: number) => {
    setHiddenLeagues(prev => new Set([...prev, leagueId]));
  };

  const hideTeam = (teamId: string) => {
    setHiddenTeams(prev => new Set([...prev, teamId]));
  };

  const isLeagueHidden = (leagueId: number) => {
    return hiddenLeagues.has(leagueId);
  };

  const isTeamHidden = (teamId: string) => {
    return hiddenTeams.has(teamId);
  };

  const isLeagueInSidebar = (leagueId: number) => {
    return customLeagues.some(l => l.id === leagueId) && !hiddenLeagues.has(leagueId);
  };

  const isTeamInSidebar = (teamId: string) => {
    return customTeams.some(t => t.id === teamId) && !hiddenTeams.has(teamId);
  };

  const resetToDefaults = () => {
    // Completely clear all sidebar data
    setCustomLeagues([]);
    setCustomTeams([]);
    setHiddenLeagues(new Set());
    setHiddenTeams(new Set());
    
    if (typeof window !== 'undefined') {
      // Clear ALL sidebar-related localStorage
      localStorage.removeItem('sidebar-custom-leagues');
      localStorage.removeItem('sidebar-custom-teams');
      localStorage.removeItem('sidebar-hidden-leagues');
      localStorage.removeItem('sidebar-hidden-teams');
      localStorage.removeItem('sidebar-initialized');
      
      // Set only leagues, no teams
      localStorage.setItem('sidebar-custom-leagues', JSON.stringify(defaultLeagues));
      localStorage.setItem('sidebar-custom-teams', JSON.stringify([]));
      localStorage.setItem('sidebar-hidden-leagues', JSON.stringify([]));
      localStorage.setItem('sidebar-hidden-teams', JSON.stringify([]));
      
      // Force immediate reload
      window.location.reload();
    }
  };

  const value: SidebarContextType = {
    customLeagues,
    customTeams,
    hiddenLeagues,
    hiddenTeams,
    addCustomLeague,
    addCustomTeam,
    hideLeague,
    hideTeam,
    isLeagueHidden,
    isTeamHidden,
    isLeagueInSidebar,
    isTeamInSidebar,
    resetToDefaults,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
