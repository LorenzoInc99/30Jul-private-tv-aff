'use client';

import { useState } from 'react';

export default function TestGlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    // This is just a demo - in the real app, search happens in the sidebar component
    // with the actual competitions data
    const mockResults = {
      teams: [
        { id: 1, name: 'Manchester United', league: 'Premier League', type: 'team' },
        { id: 2, name: 'Arsenal', league: 'Premier League', type: 'team' }
      ],
      leagues: [
        { id: 8, name: 'Premier League', country: 'England', type: 'league' }
      ],
      matches: [],
      total: 3
    };

    setResults(mockResults);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Global Search Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for teams, leagues, or matches..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

        </div>

        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Search Results for "{query}" ({results.total} total)
            </h2>

            {/* Teams */}
            {results.teams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Teams ({results.teams.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.teams.map((team: any) => (
                    <div key={team.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{team.league}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leagues */}
            {results.leagues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Leagues ({results.leagues.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.leagues.map((league: any) => (
                    <div key={league.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{league.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{league.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matches */}
            {results.matches.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Matches ({results.matches.length})
                </h3>
                <div className="space-y-3">
                  {results.matches.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                          {match.home_team?.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mx-2">vs</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                          {match.away_team?.name}
                        </span>
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(match.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {match.competition?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.total === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
