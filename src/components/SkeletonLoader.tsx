import React from 'react';

// Skeleton for match cards
export const MatchCardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-4">
      {/* Team logos */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      
      {/* Team names and score */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
        </div>
      </div>
      
      {/* Time/Status */}
      <div className="w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
    
    {/* Competition name */}
    <div className="mt-3 h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
  </div>
);

// Skeleton for league schedule
export const LeagueScheduleSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
    {/* League header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
    
    {/* Match cards */}
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Skeleton for navigation tabs
export const NavigationTabsSkeleton = () => (
  <div className="w-full bg-gray-800 dark:bg-gray-900">
    <div className="flex items-center justify-center px-4 py-3 space-x-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-gray-700 dark:bg-gray-600 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for date navigator
export const DateNavigatorSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
);

// Skeleton for sidebar
export const SidebarSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-gray-900 h-full min-h-screen w-64">
    <div className="p-4 space-y-6">
      {/* Popular Leagues */}
      <div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Popular Teams */}
      <div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
