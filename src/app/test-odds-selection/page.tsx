"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';
import { transformOdds, getBestOddsFromTransformed } from '../../lib/database-adapter';

export default function TestOddsSelectionPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testOddsSelection = async () => {
      setLoading(true);
      
      try {
        // Get a fixture with multiple odds from different bookmakers
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
              bookmaker:bookmakers(id, name, url)
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

        // Test the transformation and selection
        const rawOdds = fixture.odds || [];
        const transformedOdds = transformOdds(rawOdds);
        const bestOdds = getBestOddsFromTransformed(transformedOdds);

        // Group raw odds by label to see what's available
        const oddsByLabel = {
          home: rawOdds.filter(odd => odd.label?.toLowerCase() === '1' || odd.label?.toLowerCase() === 'home'),
          draw: rawOdds.filter(odd => odd.label?.toLowerCase() === 'x' || odd.label?.toLowerCase() === 'draw'),
          away: rawOdds.filter(odd => odd.label?.toLowerCase() === '2' || odd.label?.toLowerCase() === 'away')
        };

        setDebugInfo({
          fixture: {
            id: fixture.id,
            name: fixture.name,
            starting_at: fixture.starting_at,
            has_odds: fixture.has_odds
          },
          rawOdds: rawOdds,
          oddsByLabel: oddsByLabel,
          transformedOdds: transformedOdds,
          bestOdds: bestOdds,
          operatorsUsed: {
            home: bestOdds.home.operator?.name || 'None',
            draw: bestOdds.draw.operator?.name || 'None',
            away: bestOdds.away.operator?.name || 'None'
          }
        });
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      }
      
      setLoading(false);
    };

    testOddsSelection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Test Odds Selection</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (debugInfo?.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Test Odds Selection</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {debugInfo.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Odds Selection</h1>
        
        {/* Fixture Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Fixture Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>ID:</strong> {debugInfo.fixture.id}
            </div>
            <div>
              <strong>Name:</strong> {debugInfo.fixture.name}
            </div>
            <div>
              <strong>Date:</strong> {new Date(debugInfo.fixture.starting_at).toLocaleDateString()}
            </div>
            <div>
              <strong>Has Odds:</strong> {debugInfo.fixture.has_odds ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Operators Used */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Selected Operators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded">
              <div className="font-bold text-blue-600 dark:text-blue-400">Home (1)</div>
              <div className="text-lg font-bold">{debugInfo.operatorsUsed.home}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {debugInfo.bestOdds.home.value ? `${debugInfo.bestOdds.home.value.toFixed(2)}` : 'No odds'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded">
              <div className="font-bold text-green-600 dark:text-green-400">Draw (X)</div>
              <div className="text-lg font-bold">{debugInfo.operatorsUsed.draw}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {debugInfo.bestOdds.draw.value ? `${debugInfo.bestOdds.draw.value.toFixed(2)}` : 'No odds'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded">
              <div className="font-bold text-purple-600 dark:text-purple-400">Away (2)</div>
              <div className="text-lg font-bold">{debugInfo.operatorsUsed.away}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {debugInfo.bestOdds.away.value ? `${debugInfo.bestOdds.away.value.toFixed(2)}` : 'No odds'}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Odds by Label */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Available Odds by Outcome</h2>
          
          {Object.entries(debugInfo.oddsByLabel).map(([outcome, odds]: [string, any]) => (
            <div key={outcome} className="mb-6">
              <h3 className="font-semibold mb-2 capitalize">{outcome} Odds ({odds.length} available)</h3>
              {odds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {odds.map((odd: any) => (
                    <div key={odd.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="font-bold">{odd.bookmaker?.name || 'Unknown'}</div>
                      <div className="text-lg font-bold text-indigo-600">{odd.value?.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Market: {odd.market_id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No odds available for this outcome</p>
              )}
            </div>
          ))}
        </div>

        {/* Transformed Odds */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Transformed Odds Structure</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.transformedOdds, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">What to check:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Different Operators:</strong> Each outcome (1, X, 2) should ideally have a different operator</li>
            <li><strong>Best Odds:</strong> The selected odds should be the highest available for each outcome</li>
            <li><strong>Available Odds:</strong> Check that there are multiple bookmakers offering odds for each outcome</li>
            <li>If you see the same operator for all outcomes, there might be limited odds data in your database</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 