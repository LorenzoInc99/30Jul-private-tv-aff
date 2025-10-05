import React from 'react';

// Loading skeleton for match cards
export const MatchCardSkeleton = () => (
  <div className="w-full h-full overflow-hidden border-b border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="group w-full h-full relative p-2 md:py-0 md:px-3">
      {/* Mobile skeleton */}
      <div className="flex items-center gap-2 md:hidden w-full h-full">
        <div className="grid grid-cols-[60px_1fr_80px] gap-2 w-full items-center pl-3">
          {/* Time column skeleton */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
          </div>
          
          {/* Teams column skeleton */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          
          {/* Odds/TV skeleton */}
          <div className="flex items-center justify-center gap-4 flex-1">
            <div className="flex gap-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            </div>
          </div>
          
          {/* Score skeleton */}
          <div className="flex justify-end w-16">
            <div className="flex flex-col gap-0.5">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop skeleton */}
      <div className="hidden md:flex w-full h-full relative items-center pl-3">
        <div className="flex items-center w-80">
          {/* Time skeleton */}
          <div className="text-xs w-10 mr-5 flex flex-col items-center justify-center py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
          </div>
          
          {/* Teams skeleton */}
          <div className="flex flex-col min-w-0 flex-1 max-w-[300px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
        
        {/* Middle content skeleton */}
        <div className="flex items-center justify-center gap-8 flex-1">
          <div className="flex gap-1">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        
        {/* Score skeleton */}
        <div className="flex justify-end w-20">
          <div className="flex flex-col items-center justify-center min-w-0 w-12">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Loading skeleton for team logos
export const TeamLogoSkeleton = ({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
  );
};

// Loading skeleton for league logos
export const LeagueLogoSkeleton = ({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
  );
};

// Loading skeleton for broadcaster logos
export const BroadcasterLogoSkeleton = ({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
  );
};

// Loading skeleton for team details page
export const TeamDetailsSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
      
      {/* Form skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Matches skeleton */}
      <div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
