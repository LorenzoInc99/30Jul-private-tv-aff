"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function TestDbPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDb = async () => {
      setLoading(true);
      
      try {
        // Test 1: Check if there are any odds at all
        const { count: oddsCount, error: oddsCountError } = await supabaseBrowser
          .from('odds')
          .select('*', { count: 'exact', head: true });

        // Test 2: Check if there are any fixtures with has_odds=true
        const { count: fixturesWithOddsCount, error: fixturesCountError } = await supabaseBrowser
          .from('fixtures')
          .select('*', { count: 'exact', head: true })
          .eq('has_odds', true);

        // Test 3: Get a few odds records
        const { data: sampleOdds, error: sampleOddsError } = await supabaseBrowser
          .from('odds')
          .select('*')
          .limit(3);

        // Test 4: Get a few fixtures with odds
        const { data: sampleFixtures, error: sampleFixturesError } = await supabaseBrowser
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
              bookmaker:bookmakers(name)
            )
          `)
          .eq('has_odds', true)
          .limit(3);

        setDebugInfo({
          oddsCount: { data: oddsCount, error: oddsCountError },
          fixturesWithOddsCount: { data: fixturesWithOddsCount, error: fixturesCountError },
          sampleOdds: { data: sampleOdds, error: sampleOddsError },
          sampleFixtures: { data: sampleFixtures, error: sampleFixturesError }
        });
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      }
      
      setLoading(false);
    };

    testDb();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Testing Database...
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
          Database Test Results
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
            {/* Odds Count */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Total Odds in Database
              </h2>
              {debugInfo?.oddsCount?.error ? (
                <div className="text-red-600">{debugInfo.oddsCount.error}</div>
              ) : (
                <div className="text-2xl font-bold text-indigo-600">
                  {debugInfo?.oddsCount || 0} odds
                </div>
              )}
            </div>

            {/* Fixtures with Odds Count */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Fixtures with has_odds=true
              </h2>
              {debugInfo?.fixturesWithOddsCount?.error ? (
                <div className="text-red-600">{debugInfo.fixturesWithOddsCount.error}</div>
              ) : (
                <div className="text-2xl font-bold text-indigo-600">
                  {debugInfo?.fixturesWithOddsCount || 0} fixtures
                </div>
              )}
            </div>

            {/* Sample Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sample Odds Records
              </h2>
              {debugInfo?.sampleOdds?.error ? (
                <div className="text-red-600">{debugInfo.sampleOdds.error}</div>
              ) : debugInfo?.sampleOdds?.data?.length > 0 ? (
                <div className="space-y-2">
                  {debugInfo.sampleOdds.data.map((odd: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div><strong>ID:</strong> {odd.id}</div>
                      <div><strong>Fixture ID:</strong> {odd.fixture_id}</div>
                      <div><strong>Label:</strong> {odd.label}</div>
                      <div><strong>Value:</strong> {odd.value}</div>
                      <div><strong>Market ID:</strong> {odd.market_id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No odds found</div>
              )}
            </div>

            {/* Sample Fixtures with Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sample Fixtures with Odds
              </h2>
              {debugInfo?.sampleFixtures?.error ? (
                <div className="text-red-600">{debugInfo.sampleFixtures.error}</div>
              ) : debugInfo?.sampleFixtures?.data?.length > 0 ? (
                <div className="space-y-4">
                  {debugInfo.sampleFixtures.data.map((fixture: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-semibold mb-2">{fixture.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        ID: {fixture.id} | Has Odds: {fixture.has_odds ? 'Yes' : 'No'}
                      </div>
                      {fixture.odds?.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-sm font-semibold">Odds:</div>
                          {fixture.odds.map((odd: any, oddIndex: number) => (
                            <div key={oddIndex} className="text-xs bg-white dark:bg-gray-600 p-2 rounded">
                              <div><strong>Label:</strong> {odd.label}</div>
                              <div><strong>Value:</strong> {odd.value}</div>
                              <div><strong>Bookmaker:</strong> {odd.bookmaker?.name || 'Unknown'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No odds for this fixture</div>
                      )}
                    </div>
                  ))}
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