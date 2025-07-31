'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const setupDatabase = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Setup</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Setup Database Tables</h2>
        
        <p className="text-gray-600 mb-4">
          This will check if the required tables exist and provide instructions to create missing ones.
        </p>
        
        <button
          onClick={setupDatabase}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Checking...' : 'Check Database Tables'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 rounded">
            {result.success ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong>Success!</strong> {result.message}
                {result.existingTables && result.existingTables.length > 0 && (
                  <p className="mt-2"><strong>Existing tables:</strong> {result.existingTables.join(', ')}</p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <strong>Action Required:</strong> {result.message}
                {result.missingTables && result.missingTables.length > 0 && (
                  <p className="mt-2"><strong>Missing tables:</strong> {result.missingTables.join(', ')}</p>
                )}
                
                {result.instructions && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {result.instructions.map((instruction: string, index: number) => (
                        <li key={index} className="font-mono text-xs bg-gray-100 p-1 rounded">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <h5 className="font-semibold mb-2">Steps to create tables:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                        <li>Navigate to your project</li>
                        <li>Go to <strong>SQL Editor</strong> in the left sidebar</li>
                        <li>Copy and paste the SQL code above</li>
                        <li>Click <strong>Run</strong> to execute the SQL</li>
                        <li>Come back here and click "Check Database Tables" again</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Run the database check above</li>
          <li>Create any missing tables using the provided SQL</li>
          <li>Go to <a href="/admin" className="text-blue-600 hover:underline">Admin Page</a> to fetch SportMonks data</li>
          <li>Deploy to Vercel for automated data fetching every 6 hours</li>
        </ol>
      </div>
    </div>
  );
} 