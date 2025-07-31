'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/fetch-sportmonks', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        step: 'Network Error',
        details: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">SportMonks Data Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Fetch Latest Data</h2>
        
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Fetching...' : 'Fetch SportMonks Data'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 rounded">
            {result.success ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong>Success!</strong> {result.message}
                {result.fixturesCount && (
                  <p>Fetched {result.fixturesCount} fixtures</p>
                )}
                {result.duration && (
                  <p>Duration: {result.duration}</p>
                )}
              </div>
            ) : (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {result.error}
                {result.step && (
                  <p><strong>Failed at step:</strong> {result.step}</p>
                )}
                {result.duration && (
                  <p><strong>Duration before error:</strong> {result.duration}</p>
                )}
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">Error Details</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {result.details}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 