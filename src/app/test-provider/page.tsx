'use client';

import { useState, useEffect } from 'react';
import { ProviderFactory } from '@/lib/providers/provider-factory';
import { NormalizedMatch } from '@/lib/interfaces/sports-data-provider';

export default function TestProviderPage() {
  const [matches, setMatches] = useState<NormalizedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testProvider = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const provider = ProviderFactory.getProvider();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const data = await provider.getMatchesForDate(today);
        setMatches(data);
        
        console.log('Provider test successful:', data);
        console.log('Provider type:', provider.constructor.name);
      } catch (err: any) {
        console.error('Provider test failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testProvider();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Testing provider...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Provider Test Failed</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Data Provider Test</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h2 className="text-green-800 font-semibold">✅ Provider Test Successful</h2>
        <p className="text-green-600 mt-2">
          Found {matches.length} matches using the abstraction layer
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Normalized Data Structure</h2>
        <p className="text-gray-600 mb-4">
          This shows how your data is now standardized through the abstraction layer:
        </p>
      </div>
      
      <div className="space-y-4">
        {matches.slice(0, 5).map((match) => (
          <div key={match.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{match.title}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                match.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                match.status === 'Live' ? 'bg-red-100 text-red-800' :
                match.status === 'Finished' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {match.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Teams</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Home:</span> {match.homeTeam.name}</p>
                  <p><span className="font-medium">Away:</span> {match.awayTeam.name}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Match Info</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Time:</span> {new Date(match.startTime).toLocaleString()}</p>
                  <p><span className="font-medium">Competition:</span> {match.competition.name}</p>
                  {match.scores && (
                    <p><span className="font-medium">Score:</span> {match.scores.home} - {match.scores.away}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex space-x-4 text-sm">
                <span className={`flex items-center ${match.hasOdds ? 'text-green-600' : 'text-gray-400'}`}>
                  {match.hasOdds ? '✅' : '❌'} Odds Available
                </span>
                <span className={`flex items-center ${match.hasTvInfo ? 'text-green-600' : 'text-gray-400'}`}>
                  {match.hasTvInfo ? '✅' : '❌'} TV Info Available
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length > 5 && (
        <div className="mt-6 text-center text-gray-500">
          Showing first 5 of {matches.length} matches
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-semibold mb-2">What This Means</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Your data is now standardized through the abstraction layer</li>
          <li>• You can easily switch to different APIs in the future</li>
          <li>• Your frontend components don't need to change</li>
          <li>• Data structure is consistent regardless of the source</li>
        </ul>
      </div>
    </div>
  );
}

