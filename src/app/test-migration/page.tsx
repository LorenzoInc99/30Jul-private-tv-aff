"use client";
import { useState } from 'react';
import { migrationTests } from '../../lib/test-migration';
import { debugOddsStructure, debugOddsByMarket } from '../../lib/debug-odds';
import { debugOddsTransformation } from '../../lib/debug-odds-transformation';

export default function TestMigrationPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    setIsRunning(true);
    addResult(`Starting ${testName}...`);
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      await testFunction();
      
      // Restore console.log
      console.log = originalLog;
      
      // Add captured logs to results
      logs.forEach(log => addResult(log));
      addResult(`${testName} completed successfully!`);
      
    } catch (error: any) {
      addResult(`❌ ${testName} failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Database Migration Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Controls
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => runTest('Full Migration Test', migrationTests.testMigration)}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧪 Run Full Migration Test
            </button>
            
            <button
              onClick={() => runTest('Raw Connection Test', migrationTests.testRawConnection)}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔌 Test Raw Connection
            </button>
            
            <button
              onClick={() => runTest('Data Structure Validation', migrationTests.validateDataStructure)}
              disabled={isRunning}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Validate Data Structure
            </button>
            
            <button
              onClick={() => runTest('Debug Odds Structure', debugOddsStructure)}
              disabled={isRunning}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎲 Debug Odds Structure
            </button>
            
            <button
              onClick={() => runTest('Debug Odds by Market', debugOddsByMarket)}
              disabled={isRunning}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Debug Odds by Market
            </button>
            
            <button
              onClick={() => runTest('Debug Odds Transformation', debugOddsTransformation)}
              disabled={isRunning}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Debug Odds Transformation
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              🗑️ Clear Results
            </button>
          </div>
          
          {isRunning && (
            <div className="text-blue-600 dark:text-blue-400">
              ⏳ Running tests... Please wait...
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Results
          </h2>
          
          {results.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No test results yet. Click a test button above to start testing.
            </p>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-800 dark:text-gray-200 mb-1">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What These Tests Do:
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Full Migration Test:</strong> Tests all adapter functions with real data</li>
            <li>• <strong>Raw Connection Test:</strong> Verifies basic database connectivity</li>
            <li>• <strong>Data Structure Validation:</strong> Checks if the new schema matches expectations</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 