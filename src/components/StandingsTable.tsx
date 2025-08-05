"use client";

import { useState, useEffect } from 'react';

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
    if (position === 1) return 'bg-blue-500'; // Champions League
    if (position === 2) return 'bg-green-500'; // Champions League
    if (position >= 3 && position <= 4) return 'bg-blue-500'; // Champions League
    if (position === 5) return 'bg-orange-500'; // Europa League
    if (position >= 18 && position <= 20) return 'bg-red-500'; // Relegation
    return 'bg-gray-400'; // Default
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">League Table</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">D</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">F</th>
              <th className="px-4 py-3 text-center">A</th>
              <th className="px-4 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center font-semibold">PTS</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {standings.map((standing) => (
              <tr 
                key={standing.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                {/* Position with colored indicator */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className={`w-1 h-8 rounded-full mr-3 ${getPositionColor(standing.position)}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {standing.position}
                    </span>
                  </div>
                </td>

                {/* Team */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 mr-3">
                      {standing.team?.team_logo_url ? (
                        <img 
                          src={standing.team.team_logo_url} 
                          alt={standing.team.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {standing.team?.short_code || standing.team?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {standing.team?.name || 'Unknown Team'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Statistics */}
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.played || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.won || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.drawn || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.lost || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.goals_for || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.goals_against || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {standing.goal_difference || 0}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  {standing.points || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Champions League</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Europa League</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Relegation</span>
          </div>
        </div>
      </div>
    </div>
  );
} 