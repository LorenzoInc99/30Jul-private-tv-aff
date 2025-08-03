'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function DebugLiveMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // Get today's matches
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const { data, error } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            starting_at,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            state_id,
            home_team:teams_new!fixtures_home_team_id_fkey1(name),
            away_team:teams_new!fixtures_away_team_id_fkey1(name),
            league:leagues(name)
          `)
          .gte('starting_at', today.toISOString())
          .lt('starting_at', tomorrow.toISOString())
          .order('starting_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching matches:', error);
        } else {
          console.log('Today\'s matches:', data);
          setMatches(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Helper function to get status from state_id (using the official SportMonks mapping)
  const getStatusFromStateId = (stateId: number) => {
    const statusMap: { [key: number]: string } = {
      1: 'Not Started',
      2: '1st Half',
      3: 'Half Time',
      4: 'Break',
      5: 'Full Time',
      6: 'Extra Time',
      7: 'After Extra Time',
      8: 'After Penalties',
      9: 'Penalties',
      10: 'Postponed',
      11: 'Suspended',
      12: 'Cancelled',
      13: 'To Be Announced',
      14: 'Walk Over',
      15: 'Abandoned',
      16: 'Delayed',
      17: 'Awarded',
      18: 'Interrupted',
      19: 'Awaiting Updates',
      20: 'Deleted',
      21: 'Extra Time - Break',
      22: '2nd Half',
      23: 'ET - 2nd Half',
      25: 'Penalties - Break',
      26: 'Pending'
    };
    return statusMap[stateId] || 'Unknown';
  };

  // Check if a match is live
  const isLiveMatch = (status: string) => {
    return status === '1st Half' || 
           status === '2nd Half' || 
           status === 'ET - 2nd Half' ||
           status === 'Extra Time' ||
           status === 'Penalties';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Live Matches</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const liveMatches = matches.filter(match => {
    const status = getStatusFromStateId(match.state_id);
    return isLiveMatch(status);
  });

  const upcomingMatches = matches.filter(match => {
    const status = getStatusFromStateId(match.state_id);
    return status === 'Not Started';
  });

  const finishedMatches = matches.filter(match => {
    const status = getStatusFromStateId(match.state_id);
    return status === 'Full Time' || status === 'After Extra Time' || status === 'After Penalties';
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Live Matches - Today</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Live Matches ({liveMatches.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {liveMatches.length === 0 ? (
                <div className="px-6 py-4 text-gray-500">No live matches found</div>
              ) : (
                liveMatches.map((match) => {
                  const status = getStatusFromStateId(match.state_id);
                  const startTime = new Date(match.starting_at);
                  const now = new Date();
                  const diffMs = now.getTime() - startTime.getTime();
                  const diffMinutes = Math.floor(diffMs / (1000 * 60));
                  
                  return (
                    <div key={match.id} className="px-6 py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {match.home_team?.name} vs {match.away_team?.name}
                          </div>
                          <div className="text-xs text-gray-500">{match.league?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-600">
                            {match.home_score !== null ? match.home_score : '-'} - {match.away_score !== null ? match.away_score : '-'}
                          </div>
                          <div className="text-xs text-red-500">{diffMinutes}'</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Status:</strong> {status} (state_id: {match.state_id})
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Started:</strong> {startTime.toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Upcoming Matches ({upcomingMatches.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingMatches.length === 0 ? (
                <div className="px-6 py-4 text-gray-500">No upcoming matches found</div>
              ) : (
                upcomingMatches.map((match) => {
                  const status = getStatusFromStateId(match.state_id);
                  const startTime = new Date(match.starting_at);
                  
                  return (
                    <div key={match.id} className="px-6 py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {match.home_team?.name} vs {match.away_team?.name}
                          </div>
                          <div className="text-xs text-gray-500">{match.league?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-blue-600">
                            {startTime.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Status:</strong> {status} (state_id: {match.state_id})
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Finished Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Finished Matches ({finishedMatches.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {finishedMatches.length === 0 ? (
                <div className="px-6 py-4 text-gray-500">No finished matches found</div>
              ) : (
                finishedMatches.map((match) => {
                  const status = getStatusFromStateId(match.state_id);
                  
                  return (
                    <div key={match.id} className="px-6 py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {match.home_team?.name} vs {match.away_team?.name}
                          </div>
                          <div className="text-xs text-gray-500">{match.league?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            {match.home_score !== null ? match.home_score : '-'} - {match.away_score !== null ? match.away_score : '-'}
                          </div>
                          <div className="text-xs text-green-500">FT</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Status:</strong> {status} (state_id: {match.state_id})
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* All Matches Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">All Today's Matches ({matches.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">League</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">State ID</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {matches.map((match) => {
                  const status = getStatusFromStateId(match.state_id);
                  const startTime = new Date(match.starting_at);
                  const isLive = isLiveMatch(status);
                  
                  return (
                    <tr key={match.id} className={isLive ? 'bg-red-50 dark:bg-red-900' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {startTime.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {match.home_team?.name} vs {match.away_team?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {match.league?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {match.home_score !== null ? match.home_score : '-'} - {match.away_score !== null ? match.away_score : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isLive ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          status === 'Full Time' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {match.state_id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 