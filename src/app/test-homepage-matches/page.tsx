"use client";
import { useState, useEffect } from 'react';
import { getMatchesForDate } from '@/lib/database-adapter';

export default function TestHomepageMatchesPage() {
  const [todayMatches, setTodayMatches] = useState<any[]>([]);
  const [yesterdayMatches, setYesterdayMatches] = useState<any[]>([]);
  const [tomorrowMatches, setTomorrowMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDates = async () => {
      try {
        setLoading(true);
        
        // Test today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('Testing today:', today.toISOString());
        const todayData = await getMatchesForDate(today);
        setTodayMatches(todayData || []);
        
        // Test yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        console.log('Testing yesterday:', yesterday.toISOString());
        const yesterdayData = await getMatchesForDate(yesterday);
        setYesterdayMatches(yesterdayData || []);
        
        // Test tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        console.log('Testing tomorrow:', tomorrow.toISOString());
        const tomorrowData = await getMatchesForDate(tomorrow);
        setTomorrowMatches(tomorrowData || []);
        
      } catch (error) {
        console.error('Error testing dates:', error);
      } finally {
        setLoading(false);
      }
    };

    testDates();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderMatches = (matches: any[], title: string, date: Date) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{title} ({formatDate(date)})</h2>
        {matches.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No matches found</div>
        ) : (
          <div className="space-y-2">
            {matches.slice(0, 5).map((match) => (
              <div key={match.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <div className="font-medium">
                    {match.home_team?.name} vs {match.away_team?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.Competitions?.name} • {new Date(match.start_time).toLocaleTimeString()}
                  </div>
                </div>
                <a
                  href={`/match/${match.id}-${match.home_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${match.away_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                >
                  View
                </a>
              </div>
            ))}
            {matches.length > 5 && (
              <div className="text-sm text-gray-500 text-center">
                ... and {matches.length - 5} more matches
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing Homepage Matches</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Testing Homepage Matches</h1>
        
        <div className="mb-6 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current Date Information:</h3>
          <p className="text-sm">
            <strong>Today:</strong> {formatDate(today)}<br/>
            <strong>Yesterday:</strong> {formatDate(yesterday)}<br/>
            <strong>Tomorrow:</strong> {formatDate(tomorrow)}
          </p>
        </div>

        {renderMatches(todayMatches, "Today's Matches", today)}
        {renderMatches(yesterdayMatches, "Yesterday's Matches", yesterday)}
        {renderMatches(tomorrowMatches, "Tomorrow's Matches", tomorrow)}

        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>If you see matches for any date, click "View" to test the match page</li>
            <li>If no matches are shown, the homepage will display "No matches found for this day"</li>
            <li>You can use the date navigator on the homepage to browse different dates</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 