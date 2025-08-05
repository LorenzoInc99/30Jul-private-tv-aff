'use client';

import { useState, useEffect } from 'react';
import { getMatchesForDate } from '@/lib/database-adapter';

export default function DebugFACupOdds() {
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
        
        // Filter for FA Cup matches
        const faCupMatches = data.filter((match: any) => 
          match.Competitions?.name?.toLowerCase().includes('fa cup') ||
          match.Competitions?.name?.toLowerCase().includes('cup') ||
          match.Competitions?.name?.toLowerCase().includes('fa')
        );
        
        console.log('All matches:', data);
        console.log('FA Cup matches:', faCupMatches);
        
        setMatches(faCupMatches);
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
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug FA Cup Odds</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">FA Cup Matches Found: {matches.length}</h2>
        
        {matches.length === 0 ? (
          <div className="text-yellow-500">
            No FA Cup matches found for today. This could mean:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>No FA Cup matches are scheduled for today</li>
              <li>FA Cup matches are named differently in the database</li>
              <li>FA Cup matches are in a different competition structure</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match: any) => (
              <div key={match.id} className="p-4 border rounded">
                <h3 className="font-semibold mb-2">
                  {match.home_team?.name} vs {match.away_team?.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Competition:</strong> {match.Competitions?.name}
                  </div>
                  <div>
                    <strong>Status:</strong> {match.status}
                  </div>
                  <div>
                    <strong>Has Odds:</strong> {match.Odds && match.Odds.length > 0 ? '✅ Yes' : '❌ No'}
                  </div>
                  <div>
                    <strong>Odds Count:</strong> {match.Odds?.length || 0}
                  </div>
                  <div>
                    <strong>Will Show Odds:</strong> {
                      match.Odds && match.Odds.length > 0 && match.status !== 'Finished' 
                        ? '✅ Yes' 
                        : '❌ No'
                    }
                  </div>
                </div>
                
                {match.Odds && match.Odds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Odds Data:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(match.Odds, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Full Match Data:</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(match, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">All Competitions Today:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(matches.map(m => m.Competitions?.name))).map((compName: string) => (
            <div key={compName} className="p-3 border rounded bg-blue-50">
              <strong>{compName}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Possible Issues:</h2>
        <div className="bg-yellow-50 p-4 rounded">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>No odds data:</strong> FA Cup matches might not have odds in the database</li>
            <li><strong>Wrong competition name:</strong> FA Cup might be named differently (e.g., "The FA Cup", "English Cup")</li>
            <li><strong>Finished status:</strong> FA Cup matches might be marked as finished when they shouldn't be</li>
            <li><strong>Different league structure:</strong> FA Cup might be structured differently than regular leagues</li>
            <li><strong>Odds not available:</strong> Some competitions might not have betting odds available</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 