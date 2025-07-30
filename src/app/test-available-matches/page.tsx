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
        
        // Get some sample matches
        const { data, error } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            starting_at,
            home_team_id,
            away_team_id,
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
        <h1 className="text-2xl font-bold mb-4">Available Matches</h1>
        
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
                
                return (
                  <div key={match.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {homeTeamName} vs {awayTeamName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {match.id} • {new Date(match.starting_at).toLocaleDateString()}
                        </div>
                      </div>
                      <a
                        href={matchUrl}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        View Match
                      </a>
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
            <li>If no matches are shown, there might be no data in your database</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 