'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import mobile-specific components
const MobileHomeLayout = dynamic(() => import('./MobileHomeLayout'), {
  loading: () => <MobileLayoutSkeleton />,
  ssr: false
});

const MobileTeamDetails = dynamic(() => import('./MobileTeamDetails'), {
  loading: () => <MobileLayoutSkeleton />,
  ssr: false
});

const VirtualMatchList = dynamic(() => import('./VirtualMatchList'), {
  loading: () => <VirtualListSkeleton />,
  ssr: false
});

const MobileBottomNavigation = dynamic(() => import('./MobileBottomNavigation'), {
  loading: () => null,
  ssr: false
});

interface MobileLayoutProps {
  children: React.ReactNode;
  matches?: any[];
  timezone?: string;
  starredMatches?: string[];
  onStarToggle?: (matchId: string) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: string[]) => void;
  team?: any;
  nextMatch?: any;
  todayMatch?: any;
  upcomingMatches?: any[];
  previousMatches?: any[];
  teamForm?: any;
}

export default function MobileLayout({
  children,
  matches = [],
  timezone = 'UTC',
  starredMatches = [],
  onStarToggle = () => {},
  onSearch = () => {},
  onFilterChange = () => {},
  team,
  nextMatch,
  todayMatch,
  upcomingMatches = [],
  previousMatches = [],
  teamForm
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsLoading(false);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isLoading) {
    return <MobileLayoutSkeleton />;
  }

  if (!isMobile) {
    return <>{children}</>;
  }

  // Determine which mobile layout to show based on props
  const isTeamPage = team && nextMatch;
  const isHomePage = matches.length > 0 && !team;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<MobileLayoutSkeleton />}>
        {isTeamPage ? (
          <MobileTeamDetails
            team={team}
            nextMatch={nextMatch}
            todayMatch={todayMatch}
            upcomingMatches={upcomingMatches}
            previousMatches={previousMatches}
            teamForm={teamForm}
            timezone={timezone}
            starredMatches={starredMatches}
            onStarToggle={onStarToggle}
          />
        ) : isHomePage ? (
          <MobileHomeLayout
            matches={matches}
            timezone={timezone}
            starredMatches={starredMatches}
            onStarToggle={onStarToggle}
            onSearch={onSearch}
            onFilterChange={onFilterChange}
          />
        ) : (
          <div className="p-4">
            {children}
          </div>
        )}
      </Suspense>
      
      <Suspense fallback={null}>
        <MobileBottomNavigation />
      </Suspense>
    </div>
  );
}

// Skeleton components for loading states
function MobileLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:hidden">
      {/* Header skeleton */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40">
        <div className="p-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
      </div>

      {/* Search skeleton */}
      <div className="sticky top-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="p-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Tab navigation skeleton */}
      <div className="sticky top-32 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="flex space-x-4 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

function VirtualListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}
