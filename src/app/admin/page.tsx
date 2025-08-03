'use client';

import { useState, useEffect } from 'react';

interface OperationResult {
  success: boolean;
  message: string;
  apiCalls?: number;
  duration?: string;
  details?: any;
  error?: string;
}

interface DatabaseStats {
  bookmakers: { count: number; lastUpdate: string | null };
  leagues: { count: number; lastUpdate: string | null };
  tvstations: { count: number; lastUpdate: string | null };
  teams_new: { count: number; lastUpdate: string | null; teamsWithLogos?: number };
  fixtures: { count: number; lastUpdate: string | null };
  countries: { count: number; lastUpdate: string | null };
  latestFixtureDate?: string;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysAhead, setDaysAhead] = useState(7);

  // Set default date range
  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7); // 7 days ago
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // 7 days from now
    
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
  }, []);

  // Load database stats on component mount
  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/admin/database-stats');
      const data = await response.json();
      
      if (data.success) {
        setDatabaseStats(data.stats);
        addLog('Database statistics loaded');
      } else {
        addLog(`Failed to load database stats: ${data.message}`);
      }
    } catch (error) {
      addLog(`Error loading database stats: ${error}`);
    }
  };

  const executeOperation = async (operation: string, params: any = {}) => {
    setIsLoading(true);
    setCurrentOperation(operation);
    setResult(null);
    addLog(`Starting operation: ${operation}`);
    
    try {
      const response = await fetch(`/api/admin/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        addLog(`✅ ${operation} completed successfully`);
        addLog(`   Duration: ${data.duration}, API Calls: ${data.apiCalls}`);
        if (data.details) {
          addLog(`   Details: ${JSON.stringify(data.details)}`);
        }
      } else {
        addLog(`❌ ${operation} failed: ${data.message}`);
      }
      
      // Refresh database stats after operation
      await loadDatabaseStats();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({ 
        success: false, 
        error: errorMessage,
        message: 'Network Error'
      });
      addLog(`❌ Network error during ${operation}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setCurrentOperation('');
    }
  };

  const getFixtures = () => {
    executeOperation('get-fixtures', { daysAhead });
  };

  const updateOdds = () => {
    if (!startDate || !endDate) {
      setResult({ success: false, message: 'Please select both start and end dates' });
      return;
    }
    executeOperation('update-odds', { startDate, endDate });
  };

  const updateTvChannels = () => {
    if (!startDate || !endDate) {
      setResult({ success: false, message: 'Please select both start and end dates' });
      return;
    }
    executeOperation('update-tv-channels', { startDate, endDate });
  };

  const updateFixtures = () => {
    if (!startDate || !endDate) {
      setResult({ success: false, message: 'Please select both start and end dates' });
      return;
    }
    executeOperation('update-fixtures', { startDate, endDate });
  };

  const updateLeagues = () => {
    executeOperation('update-leagues');
  };

  const updateTeams = () => {
    executeOperation('update-teams');
  };

  const updateCountries = () => {
    executeOperation('update-countries');
  };

  const updateBookmakers = () => {
    executeOperation('bookmakers');
  };

  const updateTvStations = () => {
    executeOperation('tv-stations');
  };

  const testConnection = () => {
    executeOperation('test-connection');
  };

  const testSchema = async () => {
    try {
      const response = await fetch('/api/admin/test-schema');
      const data = await response.json();
      
      if (data.success) {
        addLog('Database schema test completed');
        setResult({
          success: true,
          message: 'Schema test completed successfully',
          details: data.schemaInfo
        });
      } else {
        addLog(`Schema test failed: ${data.message}`);
        setResult({
          success: false,
          message: data.message
        });
      }
    } catch (error) {
      addLog(`Schema test error: ${error}`);
      setResult({
        success: false,
        message: 'Schema test failed'
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Football Data Admin Dashboard</h1>
      
      {/* Database Statistics */}
      {databaseStats && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Database Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{databaseStats.bookmakers.count}</div>
              <div className="text-sm text-gray-600">Bookmakers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{databaseStats.leagues.count}</div>
              <div className="text-sm text-gray-600">Leagues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{databaseStats.tvstations.count}</div>
              <div className="text-sm text-gray-600">TV Stations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{databaseStats.teams_new.count}</div>
              <div className="text-sm text-gray-600">Teams</div>
              {databaseStats.teams_new.teamsWithLogos && (
                <div className="text-xs text-gray-500">
                  {databaseStats.teams_new.teamsWithLogos} with logos
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{databaseStats.fixtures.count}</div>
              <div className="text-sm text-gray-600">Fixtures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{databaseStats.countries.count}</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>
          {databaseStats.latestFixtureDate && (
            <div className="mt-4 text-sm text-gray-600">
              Latest fixture: {new Date(databaseStats.latestFixtureDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-center font-semibold">Running: {currentOperation}</p>
            <p className="text-center text-sm text-gray-600 mt-2">Please wait...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Connection Test</h2>
          <p className="text-gray-600 mb-4">Test database and API connectivity</p>
          
          <div className="space-y-3">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="w-full bg-gray-500 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Test Connection
            </button>
            
            <button
              onClick={testSchema}
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Test Database Schema
            </button>
          </div>
        </div>

        {/* Static Data Updates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏗️ Static Data Updates</h2>
          <p className="text-gray-600 mb-4">Update reference data (run monthly)</p>
          
          <div className="space-y-3">
            <button
              onClick={updateBookmakers}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Bookmakers
            </button>
            
            <button
              onClick={updateLeagues}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Leagues
            </button>
            
            <button
              onClick={updateTvStations}
              disabled={isLoading}
              className="w-full bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update TV Stations
            </button>
            
            <button
              onClick={updateTeams}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Teams (Optimized)
            </button>

            <button
              onClick={updateCountries}
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Countries
            </button>
          </div>
        </div>

        {/* Dynamic Data Updates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">⚽ Dynamic Data Updates</h2>
          <p className="text-gray-600 mb-4">Update match data (run daily/weekly)</p>
          
          <div className="space-y-3">
            <button
              onClick={getFixtures}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Get Fixtures ({daysAhead} days)
            </button>
            
            <button
              onClick={updateFixtures}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Fixtures
            </button>
            
            <button
              onClick={updateOdds}
              disabled={isLoading}
              className="w-full bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Odds
            </button>
            
            <button
              onClick={updateTvChannels}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update TV Channels
            </button>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📅 Date Range Settings</h2>
          <p className="text-gray-600 mb-4">Configure date ranges for operations</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Ahead (for Get Fixtures)
              </label>
              <input
                type="number"
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Display */}
      {result && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          <div className={`p-4 rounded ${result.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
            
            {result.apiCalls && (
              <p className="mt-2"><strong>API Calls:</strong> {result.apiCalls}</p>
            )}
            
            {result.duration && (
              <p className="mt-2"><strong>Duration:</strong> {result.duration}</p>
            )}
            
            {result.details && (
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
            
            {result.error && (
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {result.error}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Real-time Logs */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📋 Operation Logs</h2>
          <button
            onClick={clearLogs}
            className="text-sm bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Clear Logs
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet. Start an operation to see logs here.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 