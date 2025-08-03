'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { getMatchStatus } from '@/lib/database-config';

export default function DebugGenkMatchPage() {
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

  // Check if a match is live
  const isLiveMatch = (status: string) => {
    return status === '1st Half' || 
           status === '2nd Half' || 
           status === 'Half Time' ||
           status === 'ET - 2nd Half' ||
           status === 'Extra Time' ||
           status === 'Penalties';
  };

  // Find Genk vs Antwerp match
  const genkMatch = matches.find(match => 
    (match.home_team?.name?.toLowerCase().includes('genk') && match.away_team?.name?.toLowerCase().includes('antwerp')) ||
    (match.away_team?.name?.toLowerCase().includes('genk') && match.home_team?.name?.toLowerCase().includes('antwerp'))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Genk vs Antwerp Match</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Genk vs Antwerp Match</h1>
        
        {genkMatch ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Genk vs Antwerp Match Found</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Match Details:</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>ID:</strong> {genkMatch.id}</li>
                    <li><strong>Name:</strong> {genkMatch.name}</li>
                    <li><strong>Home Team:</strong> {genkMatch.home_team?.name}</li>
                    <li><strong>Away Team:</strong> {genkMatch.away_team?.name}</li>
                    <li><strong>League:</strong> {genkMatch.league?.name}</li>
                    <li><strong>Start Time:</strong> {new Date(genkMatch.starting_at).toLocaleString()}</li>
                    <li><strong>Score:</strong> {genkMatch.home_score !== null ? genkMatch.home_score : '-'} - {genkMatch.away_score !== null ? genkMatch.away_score : '-'}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status Information:</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>State ID:</strong> {genkMatch.state_id}</li>
                    <li><strong>Status:</strong> {getMatchStatus(genkMatch.state_id)}</li>
                    <li><strong>Is Live:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      isLiveMatch(getMatchStatus(genkMatch.state_id)) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {isLiveMatch(getMatchStatus(genkMatch.state_id)) ? 'YES' : 'NO'}
                    </span></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Raw Data:</h3>
                <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-900 p-4 rounded">
                  {JSON.stringify(genkMatch, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>Genk vs Antwerp match not found!</strong> This match might not be in today's fixtures or the team names might be different.
          </div>
        )}

        {/* All matches for reference */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">State ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Is Live?</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {matches.map((match) => {
                  const status = getMatchStatus(match.state_id);
                  const isLive = isLiveMatch(status);
                  const startTime = new Date(match.starting_at);
                  
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isLive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {isLive ? 'YES' : 'NO'}
                        </span>
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