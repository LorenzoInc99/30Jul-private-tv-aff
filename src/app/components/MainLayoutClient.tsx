"use client";
import { usePathname } from "next/navigation";
import SidebarCompetitions from "./SidebarCompetitions";
import BetCalculatorSidebar from "./BetCalculatorSidebar";
import { useTeam } from "../../contexts/TeamContext";
import React, { useEffect, useState } from "react";

export default function MainLayoutClient({ competitions, children }: { competitions: any[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { teamData, teamMatches, currentPage, matchesPerPage, handlePrevious, handleNext, handleMatchClick, setTeamData, setTeamMatches } = useTeam();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear team context when navigating to home page
  useEffect(() => {
    if (pathname === '/') {
      setTeamData(null);
      setTeamMatches([]);
    }
  }, [pathname, setTeamData, setTeamMatches]);

  const hideSidebarRoutes = ["/about", "/contact", "/privacy-policy", "/terms-of-service"];
  const shouldShowSidebar = mounted && !hideSidebarRoutes.includes(pathname);
  
  // Check if we're on a bet calculator page
  const isBetCalculatorPage = pathname.startsWith('/bet-calculator');

  return (
    <div className="w-full md:flex md:justify-center min-h-screen">
      <div className="flex w-full min-h-screen">
                {/* Sidebar - hidden on mobile, visible on desktop */}
        {shouldShowSidebar && (
          <div className="hidden md:block">
            {isBetCalculatorPage ? (
              <BetCalculatorSidebar />
            ) : (
              <SidebarCompetitions 
                competitions={competitions}
                teamData={teamData}
                teamMatches={teamMatches || []}
                currentPage={currentPage}
                matchesPerPage={matchesPerPage}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onMatchClick={handleMatchClick}
              />
            )}
          </div>
        )}
        {/* Main content - full width on mobile, flex-1 on desktop */}
        <main role="main" className="flex-1 min-w-0 w-full md:w-auto">{children}</main>
      </div>
    </div>
  );
} 