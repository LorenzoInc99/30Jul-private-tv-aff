'use client';

import { useState, useEffect } from 'react';
import { getMatchesForDate } from '@/lib/database-adapter';

export default function DebugDuplicateMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('2024-06-15');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  // Function to get a broader range of dates to test
  const getDateRange = () => {
    const dates = [];
    // Test a much broader range - from 2023 to 2025
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2025-12-31');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  // Function to find dates with data
  const findDatesWithData = async () => {
    setScanning(true);
    const dateRange = getDateRange();
    const datesWithData: string[] = [];
    
    console.log('Searching for dates with data across a broad range...');
    
    // Test more dates - let's try 50 dates to find data
    for (let i = 0; i < Math.min(dateRange.length, 50); i++) {
      const date = dateRange[i];
      try {
        console.log(`Testing date ${i + 1}/50: ${date}`);
        const data = await getMatchesForDate(new Date(date));
        if (data && data.length > 0) {
          datesWithData.push(date);
          console.log(`✅ Found data for ${date}: ${data.length} matches`);
          // Stop after finding 5 dates with data to avoid too many requests
          if (datesWithData.length >= 5) {
            console.log('Found enough dates, stopping scan');
            break;
          }
        } else {
          console.log(`❌ No data for ${date}`);
        }
      } catch (err) {
        console.log(`❌ Error for ${date}:`, err);
      }
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setAvailableDates(datesWithData);
    setScanning(false);
    console.log('Available dates found:', datesWithData);
  };

  useEffect(() => {
    findDatesWithData();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const date = new Date(selectedDate);
        console.log('Fetching matches for date:', selectedDate, 'Date object:', date);
        const data = await getMatchesForDate(date);
        console.log('Fetched data:', data);
        setMatches(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate]);

  // Find teams that appear in multiple matches at the same time
  const findDuplicateTeams = () => {
    const timeGroups: { [key: string]: any[] } = {};
    
    matches.forEach(match => {
      const timeKey = match.start_time;
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = [];
      }
      timeGroups[timeKey].push(match);
    });

    const duplicateTeams: any[] = [];
    
    Object.entries(timeGroups).forEach(([time, timeMatches]) => {
      if (timeMatches.length > 1) {
        const teamAppearances: { [teamId: number]: any[] } = {};
        
        timeMatches.forEach(match => {
          const homeTeamId = match.home_team?.id;
          const awayTeamId = match.away_team?.id;
          
          if (homeTeamId) {
            if (!teamAppearances[homeTeamId]) {
              teamAppearances[homeTeamId] = [];
            }
            teamAppearances[homeTeamId].push({
              ...match,
              role: 'home',
              opponent: match.away_team?.name
            });
          }
          
          if (awayTeamId) {
            if (!teamAppearances[awayTeamId]) {
              teamAppearances[awayTeamId] = [];
            }
            teamAppearances[awayTeamId].push({
              ...match,
              role: 'away',
              opponent: match.home_team?.name
            });
          }
        });

        // Check for teams that appear multiple times
        Object.entries(teamAppearances).forEach(([teamId, appearances]) => {
          if (appearances.length > 1) {
            const teamName = appearances[0].role === 'home' 
              ? appearances[0].home_team?.name 
              : appearances[0].away_team?.name;
              
            duplicateTeams.push({
              time,
              teamId: parseInt(teamId),
              teamName,
              appearances: appearances.map(a => ({
                fixtureId: a.id,
                fixtureName: a.name,
                role: a.role,
                opponent: a.opponent,
                competition: a.Competitions?.name
              }))
            });
          }
        });
      }
    });

    return duplicateTeams;
  };

  const duplicateTeams = findDuplicateTeams();

  if (loading || scanning) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Duplicate Matches</h1>
          <div>
            {scanning ? 'Scanning for dates with data...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Duplicate Matches</h1>
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Duplicate Matches</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Available Dates with Data</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {availableDates.length > 0 ? (
              <div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Found {availableDates.length} dates with data. Click on a date to view matches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedDate === date 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-600 mb-2">❌ No dates with data found!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  This means your database doesn't have any match data for the scanned date range (2023-2025).
                </p>
                <button
                  onClick={findDatesWithData}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Scan Again
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p><strong>Total Matches:</strong> {matches.length}</p>
            <p><strong>Teams with Duplicate Appearances:</strong> {duplicateTeams.length}</p>
            {matches.length === 0 && (
              <p className="text-orange-600 mt-2">
                ⚠️ No matches found for this date. Try selecting a different date from the available dates above.
              </p>
            )}
          </div>
        </div>

        {duplicateTeams.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-red-600">⚠️ Duplicate Team Appearances</h2>
            {duplicateTeams.map((duplicate, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  {duplicate.teamName} (ID: {duplicate.teamId}) at {new Date(duplicate.time).toLocaleTimeString()}
                </h3>
                <div className="mt-2">
                  {duplicate.appearances.map((appearance: any, idx: any) => (
                    <div key={idx} className="ml-4 mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                      <p><strong>Match {idx + 1}:</strong> {appearance.fixtureName}</p>
                      <p><strong>Role:</strong> {appearance.role}</p>
                      <p><strong>Opponent:</strong> {appearance.opponent}</p>
                      <p><strong>Competition:</strong> {appearance.competition}</p>
                      <p><strong>Fixture ID:</strong> {appearance.fixtureId}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {matches.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">All Matches</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Home Team</th>
                    <th className="px-4 py-2 text-left">Away Team</th>
                    <th className="px-4 py-2 text-left">Competition</th>
                    <th className="px-4 py-2 text-left">Fixture ID</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-4 py-2">
                        {new Date(match.start_time).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2">{match.home_team?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">{match.away_team?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">{match.Competitions?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">{match.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 