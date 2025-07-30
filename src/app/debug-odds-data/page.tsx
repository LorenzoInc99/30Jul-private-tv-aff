"use client";
import { useState, useEffect } from 'react';
import { getMatchesForDate } from '../../lib/database-adapter';

export default function DebugOddsDataPage() {
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
        setMatches(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Loading odds data...
          </h1>
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Error Loading Data
          </h1>
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6">
            <div className="text-red-800 dark:text-red-200">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Debug: Odds Data Analysis
        </h1>
        
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div><strong>Total Matches:</strong> {matches.length}</div>
              <div><strong>Matches with Odds:</strong> {matches.filter(m => m.Odds && m.Odds.length > 0).length}</div>
              <div><strong>Matches without Odds:</strong> {matches.filter(m => !m.Odds || m.Odds.length === 0).length}</div>
            </div>
          </div>

          {/* Matches with Odds */}
          {matches.filter(m => m.Odds && m.Odds.length > 0).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Matches with Odds Data
              </h2>
              <div className="space-y-4">
                {matches.filter(m => m.Odds && m.Odds.length > 0).slice(0, 3).map((match, index) => (
                  <div key={match.id} className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Match {index + 1}: {match.home_team?.name} vs {match.away_team?.name}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      ID: {match.id} | Status: {match.status}
                    </div>
                    
                    {/* Raw Odds Data */}
                    <div className="mb-4">
                      <strong>Raw Odds Data:</strong>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(match.Odds, null, 2)}
                      </pre>
                    </div>

                    {/* Transformed Odds Analysis */}
                    <div className="mb-4">
                      <strong>Transformed Odds Analysis:</strong>
                      <div className="text-sm mt-2">
                        {match.Odds.map((market: any, marketIndex: number) => (
                          <div key={marketIndex} className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div><strong>Market {marketIndex + 1}:</strong></div>
                            <div>ID: {market.id}</div>
                            <div>Fixture ID: {market.fixture_id}</div>
                            <div>Home Win: {market.home_win || 'N/A'}</div>
                            <div>Draw: {market.draw || 'N/A'}</div>
                            <div>Away Win: {market.away_win || 'N/A'}</div>
                            <div>Bookmaker: {market.Operators?.name || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches without Odds */}
          {matches.filter(m => !m.Odds || m.Odds.length === 0).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Matches without Odds Data
              </h2>
              <div className="space-y-2">
                {matches.filter(m => !m.Odds || m.Odds.length === 0).slice(0, 5).map((match, index) => (
                  <div key={match.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <strong>{match.home_team?.name} vs {match.away_team?.name}</strong> 
                    (ID: {match.id}, Status: {match.status})
                    <div className="text-gray-500">Odds: {match.Odds ? `Array with ${match.Odds.length} items` : 'null/undefined'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Raw Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Sample Raw Match Data (First Match)
            </h2>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
              {JSON.stringify(matches[0], null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 