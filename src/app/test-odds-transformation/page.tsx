"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';
import { transformOdds, getBestOddsFromTransformed } from '../../lib/database-adapter';

export default function TestOddsTransformationPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testTransformation = async () => {
      setLoading(true);
      
      try {
        // Get a fixture with odds
        const { data: fixture, error: fixtureError } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            starting_at,
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

        if (fixtureError || !fixture) {
          setDebugInfo({ error: fixtureError?.message || 'No fixture found' });
          setLoading(false);
          return;
        }

        // Test the transformation
        const rawOdds = fixture.odds || [];
        const transformedOdds = transformOdds(rawOdds);
        const bestOdds = getBestOddsFromTransformed(transformedOdds);

        setDebugInfo({
          fixture: {
            id: fixture.id,
            name: fixture.name,
            starting_at: fixture.starting_at,
            has_odds: fixture.has_odds
          },
          rawOdds: rawOdds,
          transformedOdds: transformedOdds,
          bestOdds: bestOdds
        });
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      }
      
      setLoading(false);
    };

    testTransformation();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Testing Odds Transformation...
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
          Odds Transformation Test Results
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
            {/* Fixture Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Fixture Information
              </h2>
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {debugInfo?.fixture?.id}</div>
                <div><strong>Name:</strong> {debugInfo?.fixture?.name}</div>
                <div><strong>Start Time:</strong> {new Date(debugInfo?.fixture?.starting_at).toLocaleString()}</div>
                <div><strong>Has Odds:</strong> {debugInfo?.fixture?.has_odds ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Raw Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Raw Odds Data ({debugInfo?.rawOdds?.length || 0} odds)
              </h2>
              <div className="space-y-2">
                {debugInfo?.rawOdds?.map((odd: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div><strong>ID:</strong> {odd.id}</div>
                    <div><strong>Label:</strong> {odd.label}</div>
                    <div><strong>Value:</strong> {odd.value}</div>
                    <div><strong>Market ID:</strong> {odd.market_id}</div>
                    <div><strong>Bookmaker:</strong> {odd.bookmaker?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transformed Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Transformed Odds ({debugInfo?.transformedOdds?.length || 0} markets)
              </h2>
              <div className="space-y-2">
                {debugInfo?.transformedOdds?.map((market: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div><strong>Market ID:</strong> {market.id}</div>
                    <div><strong>Fixture ID:</strong> {market.fixture_id}</div>
                    <div><strong>Home Win:</strong> {market.home_win || 'N/A'}</div>
                    <div><strong>Draw:</strong> {market.draw || 'N/A'}</div>
                    <div><strong>Away Win:</strong> {market.away_win || 'N/A'}</div>
                    <div><strong>Bookmaker:</strong> {market.Operators?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Best Odds (Final Result)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {debugInfo?.bestOdds?.home?.value ? debugInfo.bestOdds.home.value.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Home</div>
                  <div className="text-xs text-gray-500">{debugInfo?.bestOdds?.home?.operator?.name || 'N/A'}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {debugInfo?.bestOdds?.draw?.value ? debugInfo.bestOdds.draw.value.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Draw</div>
                  <div className="text-xs text-gray-500">{debugInfo?.bestOdds?.draw?.operator?.name || 'N/A'}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {debugInfo?.bestOdds?.away?.value ? debugInfo.bestOdds.away.value.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Away</div>
                  <div className="text-xs text-gray-500">{debugInfo?.bestOdds?.away?.operator?.name || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 