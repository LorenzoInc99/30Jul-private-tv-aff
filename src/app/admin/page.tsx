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

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [result, setResult] = useState<OperationResult | null>(null);
  
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

  const executeOperation = async (operation: string, params: any = {}) => {
    setIsLoading(true);
    setCurrentOperation(operation);
    setResult(null);
    
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
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Network Error'
      });
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

  const testConnection = () => {
    executeOperation('test-connection');
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Football Data Admin Dashboard</h1>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-center">Running: {currentOperation}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Connection Test</h2>
          <p className="text-gray-600 mb-4">Test database and API connectivity</p>
          
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="w-full bg-gray-500 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Test Connection
          </button>
        </div>

        {/* Get Fixtures */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📅 Get Fixtures</h2>
          <p className="text-gray-600 mb-4">Fetch fixtures for the next X days</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days Ahead
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
          
          <button
            onClick={getFixtures}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Get Fixtures
          </button>
        </div>

        {/* Update Fixtures */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">⚽ Update Fixtures</h2>
          <p className="text-gray-600 mb-4">Update fixtures for a date range</p>
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <button
            onClick={updateFixtures}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Update Fixtures
          </button>
        </div>

        {/* Update Odds */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🎰 Update Odds</h2>
          <p className="text-gray-600 mb-4">Update match odds for a date range</p>
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <button
            onClick={updateOdds}
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Update Odds
          </button>
        </div>

        {/* Update TV Channels */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📺 Update TV Channels</h2>
          <p className="text-gray-600 mb-4">Update TV channels for a date range</p>
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <button
            onClick={updateTvChannels}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Update TV Channels
          </button>
        </div>

        {/* Static Data Updates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏗️ Static Data Updates</h2>
          <p className="text-gray-600 mb-4">Update reference data (teams, leagues, countries)</p>
          
          <div className="space-y-3">
            <button
              onClick={updateLeagues}
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Leagues
            </button>
            
            <button
              onClick={updateTeams}
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Update Teams
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
    </div>
  );
} 