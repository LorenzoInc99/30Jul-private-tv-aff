"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function DebugOddsTestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugOdds = async () => {
      setLoading(true);
      
      try {
        // Get the specific match that should have odds (from our earlier debug)
        const { data: fixture, error } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            starting_at,
            state_id,
            league:leagues(name),
            home_team:teams_new!fixtures_home_team_id_fkey1(name),
            away_team:teams_new!fixtures_away_team_id_fkey1(name),
            odds(
              id,
              label,
              value,
              market_id,
              bookmaker:bookmakers(name, url)
            )
          `)
          .eq('id', 19428572) // The Anderlecht vs Westerlo match from earlier debug
          .single();

        if (error) {
          setDebugInfo({ error: error.message });
        } else {
          setDebugInfo({
            fixture,
            oddsCount: fixture?.odds?.length || 0,
            hasOdds: fixture?.odds && fixture.odds.length > 0
          });
        }
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      }
      
      setLoading(false);
    };

    debugOdds();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Debugging Odds for Specific Match...
          </h1>
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Odds Debug for Match ID 19428572
        </h1>
        
        {debugInfo?.error ? (
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
              Error
            </h2>
            <div className="text-red-800 dark:text-red-200">{debugInfo.error}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Match Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Match Information
              </h2>
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {debugInfo?.fixture?.id}</div>
                <div><strong>Name:</strong> {debugInfo?.fixture?.name}</div>
                <div><strong>Start Time:</strong> {debugInfo?.fixture?.starting_at}</div>
                <div><strong>League:</strong> {debugInfo?.fixture?.league?.name}</div>
                <div><strong>Home Team:</strong> {debugInfo?.fixture?.home_team?.name}</div>
                <div><strong>Away Team:</strong> {debugInfo?.fixture?.away_team?.name}</div>
              </div>
            </div>

            {/* Odds Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Odds Information
              </h2>
              <div className="space-y-2 text-sm">
                <div><strong>Has Odds:</strong> {debugInfo?.hasOdds ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Odds Count:</strong> {debugInfo?.oddsCount}</div>
              </div>
              
              {debugInfo?.hasOdds && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Odds Details
                  </h3>
                  <div className="space-y-2">
                    {debugInfo?.fixture?.odds?.map((odd: any, index: number) => (
                      <div key={index} className="border-t pt-2 text-sm">
                        <div><strong>Label:</strong> {odd.label}</div>
                        <div><strong>Value:</strong> {odd.value}</div>
                        <div><strong>Market ID:</strong> {odd.market_id}</div>
                        <div><strong>Bookmaker:</strong> {odd.bookmaker?.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Raw Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Raw Data
              </h2>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
                {JSON.stringify(debugInfo?.fixture, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 