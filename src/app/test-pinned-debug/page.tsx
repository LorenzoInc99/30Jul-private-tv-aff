"use client";
import { useState, useEffect } from 'react';
import { getPinnedLeagues, addPinnedLeague, removePinnedLeague, togglePinnedLeague } from '../../lib/pinned-leagues';

export default function TestPinnedDebug() {
  const [pinnedLeagues, setPinnedLeagues] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<string>('');

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
    updateLocalStorageData();
  }, []);

  const updatePinnedLeagues = () => {
    const pinned = getPinnedLeagues();
    setPinnedLeagues(pinned);
    console.log('Pinned leagues from localStorage:', pinned);
  };

  const updateLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('pinned-leagues');
      setLocalStorageData(data || 'null');
    }
  };

  const handlePinToggle = (league: any) => {
    console.log('Toggling pin for league:', league);
    togglePinnedLeague(league);
    updatePinnedLeagues();
    updateLocalStorageData();
  };

  const handleClearAll = () => {
    pinnedLeagues.forEach(league => {
      removePinnedLeague(league.id);
    });
    updatePinnedLeagues();
    updateLocalStorageData();
  };

  const handleAddTestLeague = () => {
    const testLeague = { id: 999, name: "Test League" };
    addPinnedLeague(testLeague);
    updatePinnedLeagues();
    updateLocalStorageData();
  };

  if (!mounted) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pinned Leagues Debug</h1>
      
      {/* Debug Info */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <p><strong>Mounted:</strong> {mounted ? 'Yes' : 'No'}</p>
        <p><strong>Pinned Leagues Count:</strong> {pinnedLeagues.length}</p>
        <p><strong>localStorage Key:</strong> pinned-leagues</p>
        <p><strong>localStorage Value:</strong> {localStorageData}</p>
      </div>

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
        <button
          onClick={handleAddTestLeague}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Test League (ID: 999)
        </button>
      </div>

      {/* Raw localStorage Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Raw localStorage Data</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {localStorageData}
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">How to Test:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Click "Pin" on any league to add it to your pinned list</li>
          <li>Click "Unpin" to remove it from the pinned list</li>
          <li>Check the debug information above to see what's happening</li>
          <li>After pinning leagues, go to the main page to see if the sidebar updates</li>
          <li>Try refreshing the page to see if pinned leagues persist</li>
        </ul>
      </div>
    </div>
  );
} 