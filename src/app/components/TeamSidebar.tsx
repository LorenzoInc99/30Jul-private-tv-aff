"use client";
import { useState } from 'react';
import { slugify } from '../../lib/utils';

interface TeamSidebarProps {
  team: any;
  allMatches: any[];
  currentPage: number;
  matchesPerPage: number;
  onPrevious: () => void;
  onNext: () => void;
  onMatchClick: (match: any) => void;
}

export default function TeamSidebar({ 
  team, 
  allMatches, 
  currentPage, 
  matchesPerPage, 
  onPrevious, 
  onNext, 
  onMatchClick 
}: TeamSidebarProps) {
  
  const getCurrentPageMatches = (matches: any[]) => {
    const startIndex = currentPage * matchesPerPage;
    return matches.slice(startIndex, startIndex + matchesPerPage);
  };

  return (
    <aside className="block w-64 bg-white dark:bg-gray-900 h-full min-h-screen">
      <div className="p-4 h-full">
        {/* Team Matches Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {team.name} Matches
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Recent and upcoming matches
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onPrevious}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            PREVIOUS
          </button>
          <button 
            onClick={onNext}
            disabled={currentPage >= Math.ceil((allMatches.length - 1) / matchesPerPage)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage >= Math.ceil((allMatches.length - 1) / matchesPerPage)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            NEXT
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto">
          {getCurrentPageMatches(allMatches).map((match) => {
            if (!match) return null;
            
            const isUpcoming = new Date(match.start_time) > new Date();
            const isFinished = match.status === 'FT' || match.status === 'AET' || match.status === 'PEN';
            
            return (
              <div key={match.id} className="border-b border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                   onClick={() => onMatchClick(match)}>
                
                {/* Competition Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {match.Competitions?.name}
                  </span>
                </div>

                {/* Match Details */}
                <div className="space-y-1">
                  {/* Date and Time */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {isUpcoming 
                      ? new Date(match.start_time).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: '2-digit' 
                        }) + ' ' + new Date(match.start_time).toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : isFinished 
                        ? new Date(match.start_time).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: '2-digit' 
                          }) + ' FT'
                        : new Date(match.start_time).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: '2-digit' 
                          })
                    }
                  </div>

                  {/* Teams */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex-shrink-0">
                        <img 
                          src={match.home_team?.team_logo_url} 
                          alt={match.home_team?.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {match.home_team?.name}
                      </span>
                      {isFinished && (
                        <span className="text-sm font-bold text-gray-900 dark:text-white ml-auto">
                          {match.home_score}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex-shrink-0">
                        <img 
                          src={match.away_team?.team_logo_url} 
                          alt={match.away_team?.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {match.away_team?.name}
                      </span>
                      {isFinished && (
                        <span className="text-sm font-bold text-gray-900 dark:text-white ml-auto">
                          {match.away_score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Result Badge for Finished Matches */}
                  {isFinished && (
                    <div className="flex justify-end mt-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        match.home_team_id === team.id 
                          ? (match.home_score > match.away_score ? 'bg-green-100 text-green-800' :
                             match.home_score === match.away_score ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                          : (match.away_score > match.home_score ? 'bg-green-100 text-green-800' :
                             match.away_score === match.home_score ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                      }`}>
                        {match.home_team_id === team.id 
                          ? (match.home_score > match.away_score ? 'W' :
                             match.home_score === match.away_score ? 'D' : 'L')
                          : (match.away_score > match.home_score ? 'W' :
                             match.away_score === match.home_score ? 'D' : 'L')
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {getCurrentPageMatches(allMatches).length === 0 && (
            <div className="text-center text-gray-500 py-8 px-4">
              No matches found
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
