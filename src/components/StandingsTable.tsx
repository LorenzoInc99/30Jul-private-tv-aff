"use client";

import { useState, useEffect } from 'react';
import { getPositionQualificationColor } from '@/lib/utils';

interface Standing {
  id: number;
  season_id: number;
  team_id: number;
  position: number;
  points: number;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goals_for: number | null;
  goals_against: number | null;
  goal_difference: number | null;
  last_5_form: string[];
  team?: {
    id: number;
    name: string;
    short_code: string | null;
    team_logo_url: string | null;
  };
  season?: {
    id: number;
    name: string;
    league_id: number;
  };
}

interface StandingsTableProps {
  leagueId: number;
  className?: string;
}

export default function StandingsTable({ leagueId, className = "" }: StandingsTableProps) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/standings/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load standings');
        }

        setStandings(result.data || []);
      } catch (err: any) {
        console.error('Error fetching standings:', err);
        setError(err.message || 'Failed to load standings');
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, [leagueId]);

  const getPositionColor = (position: number) => {
    return getPositionQualificationColor(leagueId, position);
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Failed to load standings</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6 text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No standings available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Standings will appear here once the season starts</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-center">P</th>
              <th className="px-3 py-2 text-center">W</th>
              <th className="px-3 py-2 text-center">D</th>
              <th className="px-3 py-2 text-center">L</th>
              <th className="px-3 py-2 text-center">DIFF</th>
              <th className="px-3 py-2 text-center">Goals</th>
              <th className="px-3 py-2 text-center">Last 5</th>
              <th className="px-3 py-2 text-center font-semibold">PTS</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {standings.map((standing) => (
              <tr 
                key={standing.id} 
                className="hover:bg-gray-750 transition-colors duration-150"
              >
                {/* Position with circular badge */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getPositionColor(standing.position)}`}>
                      {standing.position}
                    </div>
                  </div>
                </td>

                {/* Team */}
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 mr-2">
                      {standing.team?.team_logo_url ? (
                        <img 
                          src={standing.team.team_logo_url} 
                          alt={standing.team.name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-300">
                            {standing.team?.short_code || standing.team?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {standing.team?.name || 'Unknown Team'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Statistics */}
                <td className="px-3 py-2 text-center text-sm text-white">
                  {standing.played || 0}
                </td>
                <td className="px-3 py-2 text-center text-sm text-white">
                  {standing.won || 0}
                </td>
                <td className="px-3 py-2 text-center text-sm text-white">
                  {standing.drawn || 0}
                </td>
                <td className="px-3 py-2 text-center text-sm text-white">
                  <span className={standing.lost && standing.lost > 0 ? 'text-red-400' : 'text-white'}>
                    {standing.lost || 0}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-sm text-white">
                  <span className={standing.goal_difference && standing.goal_difference < 0 ? 'text-red-400' : 'text-white'}>
                    {standing.goal_difference || 0}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-sm text-white">
                  {standing.goals_for || 0}:{standing.goals_against || 0}
                </td>
                
                {/* Last 5 Form */}
                <td className="px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {standing.last_5_form?.slice(0, 5).map((result, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-sm ${
                          result === 'W' ? 'bg-green-500' :
                          result === 'D' ? 'bg-yellow-500' :
                          result === 'L' ? 'bg-red-500' :
                          'bg-gray-600'
                        }`}
                        title={result}
                      />
                    ))}
                    {/* Fill remaining slots if less than 5 matches */}
                    {Array.from({ length: Math.max(0, 5 - (standing.last_5_form?.length || 0)) }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-3 h-3 rounded-sm bg-gray-600"
                      />
                    ))}
                  </div>
                </td>
                
                <td className="px-3 py-2 text-center text-sm font-semibold text-white">
                  {standing.points || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 