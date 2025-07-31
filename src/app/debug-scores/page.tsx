"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function DebugScoresPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get overall statistics
        const { data: totalMatches, error: totalError } = await supabaseBrowser
          .from('fixtures')
          .select('id', { count: 'exact' });
        
        const { data: matchesWithScores, error: scoresError } = await supabaseBrowser
          .from('fixtures')
          .select('id', { count: 'exact' })
          .not('home_score', 'is', null)
          .not('away_score', 'is', null);
        
        const { data: recentData, error: recentError } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            starting_at,
            home_score,
            away_score,
            state_id,
            home_team:teams_new!fixtures_home_team_id_fkey1(name),
            away_team:teams_new!fixtures_away_team_id_fkey1(name)
          `)
          .not('home_score', 'is', null)
          .not('away_score', 'is', null)
          .order('starting_at', { ascending: false })
          .limit(10);
        
        if (totalError || scoresError || recentError) {
          console.error('Error fetching data:', { totalError, scoresError, recentError });
        } else {
          setStats({
            total: totalMatches?.length || 0,
            withScores: matchesWithScores?.length || 0,
            percentage: totalMatches?.length ? Math.round((matchesWithScores?.length || 0) / totalMatches.length * 100) : 0
          });
          setRecentMatches(recentData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusFromStateId = (stateId: number) => {
    const statusMap: { [key: number]: string } = {
      1: 'Scheduled',
      2: 'Live',
      3: 'Finished',
      4: 'Postponed',
      5: 'Cancelled',
      6: 'Suspended',
      7: 'Abandoned',
      8: 'Not Started',
      9: 'First Half',
      10: 'Half Time',
      11: 'Second Half',
      12: 'Extra Time',
      13: 'Penalty In Progress',
      14: 'Break Time',
      15: 'Match Suspended',
      16: 'Match Interrupted',
      17: 'Match Postponed',
      18: 'Match Cancelled',
      19: 'Match Abandoned',
      20: 'Technical Loss',
      21: 'Walkover',
      22: 'Live Extra Time',
      23: 'Finished',
      24: 'Finished',
      25: 'Finished'
    };
    return statusMap[stateId] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Score Debug Information</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Score Debug Information</h1>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Matches</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.total || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">With Scores</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.withScores || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Percentage</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.percentage || 0}%</p>
          </div>
        </div>

        {/* Recent Matches with Scores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Recent Matches with Scores (Last 10)</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentMatches.length === 0 ? (
              <div className="px-6 py-4 text-gray-500">
                No matches with scores found in the database.
              </div>
            ) : (
              recentMatches.map((match) => {
                const homeTeamName = match.home_team?.name || 'Unknown';
                const awayTeamName = match.away_team?.name || 'Unknown';
                const status = getStatusFromStateId(match.state_id);
                
                return (
                  <div key={match.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {homeTeamName} vs {awayTeamName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {match.id} • {new Date(match.starting_at).toLocaleDateString()} • State: {match.state_id} ({status})
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">{match.home_score}</span>
                          <span className="text-gray-400">-</span>
                          <span className="font-bold text-xl">{match.away_score}</span>
                          {status === 'Live' && (
                            <span className="text-red-500 text-xs font-bold animate-pulse">LIVE</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">What this page shows:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Total Matches:</strong> Total number of fixtures in your database</li>
            <li><strong>With Scores:</strong> Number of matches that have both home_score and away_score</li>
            <li><strong>Percentage:</strong> Percentage of matches that have scores</li>
            <li><strong>Recent Matches:</strong> Shows the 10 most recent matches that have scores</li>
            <li>If you see scores here, they should also appear in your main application</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="mt-4 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Troubleshooting:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>If "With Scores" is 0, your Colab script may not have fetched recent fixtures with scores</li>
            <li>If you see scores here but not in the main app, check the MatchCard component</li>
            <li>Make sure your Colab script ran successfully and populated the database</li>
            <li>Check that the date range in your Colab script includes recent matches</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 