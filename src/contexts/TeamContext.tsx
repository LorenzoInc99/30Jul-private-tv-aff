"use client";
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface TeamContextType {
  teamData: any | null;
  teamMatches: any[] | null;
  currentPage: number;
  matchesPerPage: number;
  setTeamData: (team: any) => void;
  setTeamMatches: (matches: any[]) => void;
  setCurrentPage: (page: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleMatchClick: (match: any) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teamData, setTeamData] = useState<any | null>(null);
  const [teamMatches, setTeamMatches] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const matchesPerPage = 5; // Show 5 matches per page

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (teamMatches && currentPage < Math.ceil((teamMatches.length - 1) / matchesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  }, [teamMatches, currentPage]);

  const handleMatchClick = useCallback((match: any) => {
    if (match) {
      const homeSlug = match.home_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'home';
      const awaySlug = match.away_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'away';
      const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}`;
      window.open(matchUrl, '_blank');
    }
  }, []);

  const contextValue = useMemo(() => ({
    teamData,
    teamMatches,
    currentPage,
    matchesPerPage,
    setTeamData,
    setTeamMatches,
    setCurrentPage,
    handlePrevious,
    handleNext,
    handleMatchClick
  }), [teamData, teamMatches, currentPage, matchesPerPage, handlePrevious, handleNext, handleMatchClick]);

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
