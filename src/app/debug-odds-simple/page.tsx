"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function DebugOddsSimplePage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugOdds = async () => {
      setLoading(true);
      
      try {
        // First, let's check if there are any odds at all in the database
        const { data: allOdds, error: oddsError } = await supabaseBrowser
          .from('odds')
          .select('*')
          .limit(10);

        // Then let's check if there are any fixtures with odds
        const { data: fixturesWithOdds, error: fixturesError } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            has_odds,
            has_premium_odds,
            odds(count)
          `)
          .eq('has_odds', true)
          .limit(5);

        // Let's also get a sample fixture with odds
        const { data: sampleFixture, error: sampleError } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            has_odds,
            odds(
              id,
              label,
              value,
              market_id,
              bookmaker:bookmakers(name, url)
            )
          `)
          .eq('has_odds', true)
          .limit(1)
          .single();

        setDebugInfo({
          allOdds: { data: allOdds, error: oddsError },
          fixturesWithOdds: { data: fixturesWithOdds, error: fixturesError },
          sampleFixture: { data: sampleFixture, error: sampleError }
        });
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
            Debugging Odds Data...
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
          Simple Odds Debug
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
            {/* All Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                All Odds in Database
              </h2>
              {debugInfo?.allOdds?.error ? (
                <div className="text-red-600">{debugInfo.allOdds.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><strong>Count:</strong> {debugInfo?.allOdds?.data?.length || 0}</div>
                  {debugInfo?.allOdds?.data?.length > 0 && (
                    <div>
                      <strong>Sample Odds:</strong>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(debugInfo.allOdds.data.slice(0, 3), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixtures with Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Fixtures with has_odds=true
              </h2>
              {debugInfo?.fixturesWithOdds?.error ? (
                <div className="text-red-600">{debugInfo.fixturesWithOdds.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><strong>Count:</strong> {debugInfo?.fixturesWithOdds?.data?.length || 0}</div>
                  {debugInfo?.fixturesWithOdds?.data?.length > 0 && (
                    <div>
                      <strong>Sample Fixtures:</strong>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(debugInfo.fixturesWithOdds.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sample Fixture with Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sample Fixture with Odds
              </h2>
              {debugInfo?.sampleFixture?.error ? (
                <div className="text-red-600">{debugInfo.sampleFixture.error}</div>
              ) : debugInfo?.sampleFixture?.data ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Fixture ID:</strong> {debugInfo.sampleFixture.data.id}</div>
                  <div><strong>Name:</strong> {debugInfo.sampleFixture.data.name}</div>
                  <div><strong>Has Odds:</strong> {debugInfo.sampleFixture.data.has_odds ? 'Yes' : 'No'}</div>
                  <div><strong>Odds Count:</strong> {debugInfo.sampleFixture.data.odds?.length || 0}</div>
                  {debugInfo.sampleFixture.data.odds?.length > 0 && (
                    <div>
                      <strong>Odds Details:</strong>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(debugInfo.sampleFixture.data.odds, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No fixtures with odds found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 