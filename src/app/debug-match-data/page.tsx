'use client';

import { useState, useEffect } from 'react';
import { getMatchesForDate } from '@/lib/database-adapter';

export default function DebugMatchData() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const data = await getMatchesForDate(today);
        console.log('Raw matches data:', data);
        setMatches(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Match Data</h1>
      <p className="mb-4">Total matches: {matches.length}</p>
      
      <div className="space-y-4">
        {matches.slice(0, 5).map((match, index) => (
          <div key={match.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">
              {index + 1}. {match.home_team?.name} vs {match.away_team?.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-2">Basic Info</h3>
                <p>Status: {match.status}</p>
                <p>Start Time: {new Date(match.start_time).toLocaleString()}</p>
                <p>Competition: {match.Competitions?.name}</p>
              </div>

              {/* Odds Data */}
              <div>
                <h3 className="font-semibold mb-2">Odds Data</h3>
                <p>Odds Array Length: {match.Odds?.length || 0}</p>
                {match.Odds && match.Odds.length > 0 ? (
                  <div className="text-sm">
                    <p>Sample Odds:</p>
                    {match.Odds.slice(0, 3).map((odd: any, idx: number) => (
                      <div key={idx} className="ml-2">
                        {odd.label}: {odd.value} ({odd.bookmaker?.name})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No odds data</p>
                )}
              </div>

              {/* TV Channels */}
              <div>
                <h3 className="font-semibold mb-2">TV Channels</h3>
                <p>Broadcasters Array Length: {match.Event_Broadcasters?.length || 0}</p>
                {match.Event_Broadcasters && match.Event_Broadcasters.length > 0 ? (
                  <div className="text-sm">
                    <p>TV Stations:</p>
                    {match.Event_Broadcasters.map((broadcaster: any, idx: number) => (
                      <div key={idx} className="ml-2">
                        {broadcaster.Broadcasters?.name || 'Unknown'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No TV channels</p>
                )}
              </div>

              {/* Raw Data */}
              <div>
                <h3 className="font-semibold mb-2">Raw Data</h3>
                <details>
                  <summary className="cursor-pointer text-sm">Click to see raw data</summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(match, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 