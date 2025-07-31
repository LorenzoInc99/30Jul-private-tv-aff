'use client';

import { useState } from 'react';

export default function FixRLSPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixRLS = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/fix-rls', {
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
      <h1 className="text-3xl font-bold mb-8">Fix Row Level Security (RLS)</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">Issue Detected</h2>
        <p className="text-yellow-700 mb-4">
          Your database tables exist but are blocked by Row Level Security (RLS) policies. 
          This is preventing the API from accessing the data.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Automatic Fix</h2>
        
        <p className="text-gray-600 mb-4">
          This will attempt to disable RLS policies for the required tables.
        </p>
        
        <button
          onClick={fixRLS}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Fixing...' : 'Fix RLS Policies'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 rounded">
            {result.success ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong>Success!</strong> {result.message}
                {result.successful && result.successful.length > 0 && (
                  <p className="mt-2"><strong>Fixed tables:</strong> {result.successful.map((s: any) => s.table).join(', ')}</p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <strong>Manual Action Required:</strong> {result.message}
                {result.failed && result.failed.length > 0 && (
                  <p className="mt-2"><strong>Failed tables:</strong> {result.failed.map((f: any) => f.table).join(', ')}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Manual Fix Instructions</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Option 1: Disable RLS (Recommended for Development)</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
              <li>Navigate to your project</li>
              <li>Go to <strong>Authentication</strong> → <strong>Policies</strong></li>
              <li>For each table, click the toggle to <strong>disable RLS</strong></li>
              <li>Tables to disable: states, countries, bookmakers, leagues, tvstations, teams_new, fixtures</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Option 2: Create RLS Policies (Better for Production)</h4>
            <p className="text-sm mb-2">Go to <strong>SQL Editor</strong> and run this for each table:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Example for states table
CREATE POLICY "Allow service role access" ON public.states
FOR ALL USING (true);

-- Repeat for other tables:
-- countries, bookmakers, leagues, tvstations, teams_new, fixtures`}
            </pre>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded">
          <h4 className="font-semibold mb-2">After Fixing RLS:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Test the database connection: <a href="/api/test-database" className="text-blue-600 hover:underline">Database Test</a></li>
            <li>Try fetching data: <a href="/admin" className="text-blue-600 hover:underline">Admin Page</a></li>
          </ol>
        </div>
      </div>
    </div>
  );
} 