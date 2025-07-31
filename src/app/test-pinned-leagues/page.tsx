"use client";
import { useState, useEffect } from 'react';
import { getPinnedLeagues, addPinnedLeague, removePinnedLeague, togglePinnedLeague } from '../../lib/pinned-leagues';

export default function TestPinnedLeagues() {
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Sample leagues for testing
  const sampleLeagues = [
    { id: 8, name: "Premier League" },
    { id: 564, name: "La Liga" },
    { id: 181, name: "Bundesliga" },
    { id: 384, name: "Serie A" },
    { id: 301, name: "Ligue 1" },
  ];

  useEffect(() => {
    setMounted(true);
    updatePinnedLeagues();
  }, []);

  const updatePinnedLeagues = () => {
    const pinned = getPinnedLeagues();
    setPinnedLeagues(pinned);
  };

  const handlePinToggle = (league: any) => {
    togglePinnedLeague(league);
    updatePinnedLeagues();
  };

  const handleClearAll = () => {
    pinnedLeagues.forEach(league => {
      removePinnedLeague(league.id);
    });
    updatePinnedLeagues();
  };

  if (!mounted) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pinned Leagues Test</h1>
      
      {/* Current Pinned Leagues */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Currently Pinned Leagues</h2>
        {pinnedLeagues.length === 0 ? (
          <p className="text-gray-600">No leagues pinned yet.</p>
        ) : (
          <div className="space-y-2">
            {pinnedLeagues.map(league => (
              <div key={league.id} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                <span className="font-medium">{league.name} (ID: {league.id})</span>
                <button
                  onClick={() => handlePinToggle(league)}
                  className="text-red-600 hover:text-red-800"
                >
                  Unpin
                </button>
              </div>
            ))}
            <button
              onClick={handleClearAll}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Pinned
            </button>
          </div>
        )}
      </div>

      {/* Sample Leagues to Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sample Leagues to Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleLeagues.map(league => (
            <div key={league.id} className="flex items-center justify-between p-3 border rounded">
              <span>{league.name}</span>
              <button
                onClick={() => handlePinToggle(league)}
                className={`px-3 py-1 rounded ${
                  pinnedLeagues.some(p => p.id === league.id)
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pinnedLeagues.some(p => p.id === league.id) ? 'Unpin' : 'Pin'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Raw localStorage Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Raw localStorage Data</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(pinnedLeagues, null, 2)}
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">How to Test:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Click "Pin" on any league to add it to your pinned list</li>
          <li>Click "Unpin" to remove it from the pinned list</li>
          <li>Pinned leagues will appear at the top of the sidebar</li>
          <li>Data is persisted in localStorage</li>
          <li>Try refreshing the page to see if pinned leagues persist</li>
        </ul>
      </div>
    </div>
  );
} 