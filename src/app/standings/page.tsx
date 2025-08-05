"use client";

import { useState, useEffect } from 'react';

import StandingsTable from '@/components/StandingsTable';

interface League {
  id: number;
  name: string;
  country_id: number;
}

export default function StandingsPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/leagues');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load leagues');
        }

        setLeagues(result.data || []);
      } catch (err: any) {
        console.error('Error fetching leagues:', err);
        setError(err.message || 'Failed to load leagues');
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leagues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Standings</h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            League Standings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Current league tables and team rankings
          </p>
        </div>

        {leagues.length === 0 ? (
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Leagues Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No leagues have been loaded yet. Please run the "Fetch Static Data" operation from the admin panel.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {leagues.map((league) => (
              <div key={league.id}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {league.name}
                </h2>
                <StandingsTable leagueId={league.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 