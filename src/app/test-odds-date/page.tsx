"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';
import { getMatchesForDate } from '../../lib/database-adapter';

export default function TestOddsDatePage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testOddsDate = async () => {
      setLoading(true);
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Test 1: Get matches for today using the main function
        const matchesForToday = await getMatchesForDate(today);
        
        // Test 2: Get fixtures for today directly
        const start = new Date(today);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        
        const { data: fixturesForToday, error: fixturesError } = await supabaseBrowser
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
              bookmaker:bookmakers(name)
            )
          `)
          .gte('starting_at', start.toISOString())
          .lt('starting_at', end.toISOString())
          .order('starting_at', { ascending: true });

        // Test 3: Get all fixtures with odds regardless of date
        const { data: allFixturesWithOdds, error: allFixturesError } = await supabaseBrowser
          .from('fixtures')
          .select(`
            id,
            name,
            starting_at,
            has_odds
          `)
          .eq('has_odds', true)
          .limit(10);

        setDebugInfo({
          today: today.toISOString(),
          matchesForToday: { data: matchesForToday, count: matchesForToday.length },
          fixturesForToday: { data: fixturesForToday, error: fixturesError, count: fixturesForToday?.length || 0 },
          allFixturesWithOdds: { data: allFixturesWithOdds, error: allFixturesError, count: allFixturesWithOdds?.length || 0 }
        });
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      }
      
      setLoading(false);
    };

    testOddsDate();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Testing Odds by Date...
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
          Odds Date Test Results
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
            {/* Date Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Date Information
              </h2>
              <div className="text-sm">
                <div><strong>Today (start of day):</strong> {debugInfo?.today}</div>
              </div>
            </div>

            {/* Matches for Today */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Matches for Today (using getMatchesForDate)
              </h2>
              <div className="text-2xl font-bold text-indigo-600 mb-4">
                {debugInfo?.matchesForToday?.count || 0} matches
              </div>
              {debugInfo?.matchesForToday?.data?.length > 0 && (
                <div className="space-y-2">
                  {debugInfo.matchesForToday.data.slice(0, 3).map((match: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-semibold">{match.home_team?.name} vs {match.away_team?.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Start: {new Date(match.start_time).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Odds count: {match.Odds?.length || 0}
                      </div>
                      {match.Odds?.length > 0 && (
                        <div className="text-xs mt-1">
                          <strong>Sample odds:</strong>
                          {match.Odds.slice(0, 2).map((market: any, marketIndex: number) => (
                            <div key={marketIndex} className="ml-2">
                              Home: {market.home_win || 'N/A'}, Draw: {market.draw || 'N/A'}, Away: {market.away_win || 'N/A'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fixtures for Today */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Fixtures for Today (direct query)
              </h2>
              {debugInfo?.fixturesForToday?.error ? (
                <div className="text-red-600">{debugInfo.fixturesForToday.error}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-indigo-600 mb-4">
                    {debugInfo?.fixturesForToday?.count || 0} fixtures
                  </div>
                  {debugInfo?.fixturesForToday?.data?.length > 0 && (
                    <div className="space-y-2">
                      {debugInfo.fixturesForToday.data.slice(0, 3).map((fixture: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="font-semibold">{fixture.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Start: {new Date(fixture.starting_at).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Has Odds: {fixture.has_odds ? 'Yes' : 'No'} | Odds count: {fixture.odds?.length || 0}
                          </div>
                          {fixture.odds?.length > 0 && (
                            <div className="text-xs mt-1">
                              <strong>Sample odds:</strong>
                              {fixture.odds.slice(0, 3).map((odd: any, oddIndex: number) => (
                                <div key={oddIndex} className="ml-2">
                                  {odd.label}: {odd.value} ({odd.bookmaker?.name})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* All Fixtures with Odds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                All Fixtures with has_odds=true (first 10)
              </h2>
              {debugInfo?.allFixturesWithOdds?.error ? (
                <div className="text-red-600">{debugInfo.allFixturesWithOdds.error}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-indigo-600 mb-4">
                    {debugInfo?.allFixturesWithOdds?.count || 0} fixtures
                  </div>
                  {debugInfo?.allFixturesWithOdds?.data?.length > 0 && (
                    <div className="space-y-2">
                      {debugInfo.allFixturesWithOdds.data.map((fixture: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="font-semibold">{fixture.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Start: {new Date(fixture.starting_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 