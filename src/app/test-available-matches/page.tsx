"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function TestAvailableMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // Get some sample matches with scores
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
            away_team:teams_new!fixtures_away_team_id_fkey1(name)
          `)
          .limit(20)
          .order('starting_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching matches:', error);
        } else {
          console.log('Available matches:', data);
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

  // Helper function to get status from state_id
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
          <h1 className="text-2xl font-bold mb-4">Available Matches</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Available Matches with Scores</h1>
        
        {matches.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>No matches found!</strong> There are no matches in the database.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Sample Matches (Last 20)</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {matches.map((match) => {
                const homeTeamName = match.home_team?.name || 'Unknown';
                const awayTeamName = match.away_team?.name || 'Unknown';
                const homeSlug = homeTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const awaySlug = awayTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}`;
                const status = getStatusFromStateId(match.state_id);
                const hasScore = match.home_score !== null && match.away_score !== null;
                
                return (
                  <div key={match.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {homeTeamName} vs {awayTeamName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {match.id} • {new Date(match.starting_at).toLocaleDateString()} • State: {match.state_id} ({status})
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Score Display */}
                        <div className="text-center">
                          {hasScore ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{match.home_score}</span>
                              <span className="text-gray-400">-</span>
                              <span className="font-bold text-lg">{match.away_score}</span>
                              {status === 'Live' && (
                                <span className="text-red-500 text-xs font-bold animate-pulse">LIVE</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">No score</div>
                          )}
                        </div>
                        <a
                          href={matchUrl}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                          View Match
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Click on any "View Match" button to test the match page functionality</li>
            <li>The URL format is: <code>/match/[id]-[home-team]-vs-[away-team]</code></li>
            <li>Scores are displayed if available (home_score and away_score are not null)</li>
            <li>State ID shows the raw status from the database</li>
            <li>If no matches are shown, there might be no data in your database</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 