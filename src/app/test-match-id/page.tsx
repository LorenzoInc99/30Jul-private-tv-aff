"use client";
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function TestMatchIdPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testMatchId = async () => {
      try {
        setLoading(true);
        
        // Test 1: Check if match ID 19347815 exists
        console.log('🔍 Testing match ID: 19347815');
        const { data: specificMatch, error: specificError } = await supabaseBrowser
          .from('fixtures')
          .select('*')
          .eq('id', 19347815)
          .single();
        
        console.log('🔍 Specific match result:', { data: specificMatch, error: specificError });

        // Test 2: Get some sample matches to see what IDs exist
        const { data: sampleMatches, error: sampleError } = await supabaseBrowser
          .from('fixtures')
          .select('id, name, starting_at, home_team_id, away_team_id')
          .limit(10);
        
        console.log('🔍 Sample matches:', { data: sampleMatches, error: sampleError });

        // Test 3: Check if there are any matches with similar IDs
        const { data: similarMatches, error: similarError } = await supabaseBrowser
          .from('fixtures')
          .select('id, name, starting_at')
          .gte('id', 19347000)
          .lte('id', 19348000)
          .limit(5);
        
        console.log('🔍 Similar matches:', { data: similarMatches, error: similarError });

        setTestResult({
          specificMatch: { data: specificMatch, error: specificError },
          sampleMatches: { data: sampleMatches, error: sampleError },
          similarMatches: { data: similarMatches, error: similarError }
        });
      } catch (error) {
        console.error('🔍 Error in test:', error);
        setTestResult({ error: error });
      } finally {
        setLoading(false);
      }
    };

    testMatchId();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing Match ID 19347815</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Testing Match ID 19347815</h1>
        
        {testResult?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {testResult.error.message}
          </div>
        )}

        {/* Specific Match Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 1: Specific Match (ID: 19347815)</h2>
          {testResult?.specificMatch?.error ? (
            <div className="text-red-600">
              <strong>Error:</strong> {testResult.specificMatch.error.message}
            </div>
          ) : testResult?.specificMatch?.data ? (
            <div className="text-green-600">
              <strong>✅ Match found!</strong>
              <pre className="mt-2 bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult.specificMatch.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-yellow-600">
              <strong>⚠️ No match found with ID 19347815</strong>
            </div>
          )}
        </div>

        {/* Sample Matches */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 2: Sample Matches (First 10)</h2>
          {testResult?.sampleMatches?.error ? (
            <div className="text-red-600">
              <strong>Error:</strong> {testResult.sampleMatches.error.message}
            </div>
          ) : (
            <div>
              <p className="mb-2">Available match IDs:</p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                {testResult?.sampleMatches?.data?.map((match: any) => (
                  <div key={match.id} className="mb-2">
                    <strong>ID: {match.id}</strong> - {match.name} ({new Date(match.starting_at).toLocaleDateString()})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar Matches */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 3: Similar Matches (IDs around 19347815)</h2>
          {testResult?.similarMatches?.error ? (
            <div className="text-red-600">
              <strong>Error:</strong> {testResult.similarMatches.error.message}
            </div>
          ) : testResult?.similarMatches?.data?.length > 0 ? (
            <div>
              <p className="mb-2">Matches with similar IDs:</p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                {testResult.similarMatches.data.map((match: any) => (
                  <div key={match.id} className="mb-2">
                    <strong>ID: {match.id}</strong> - {match.name} ({new Date(match.starting_at).toLocaleDateString()})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-yellow-600">
              <strong>⚠️ No matches found in the range 19347000-19348000</strong>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>If match ID 19347815 doesn't exist, try clicking on a different match from the homepage</li>
            <li>Check the console logs for more detailed debugging information</li>
            <li>The URL format should be: <code>/match/[actual-match-id]-[team-names]</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
} 