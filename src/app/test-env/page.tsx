"use client";
import { useState } from 'react';

export default function TestEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);

  const checkEnvironment = () => {
    const status = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      anonKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    };
    
    setEnvStatus(status);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Environment Variables Check
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <button
            onClick={checkEnvironment}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
          >
            🔍 Check Environment Variables
          </button>
          
          {envStatus && (
            <div className="space-y-4">
              <div className={`p-4 rounded ${envStatus.supabaseUrl ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <div className="font-semibold">
                  {envStatus.supabaseUrl ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {envStatus.urlValue}
                </div>
              </div>
              
              <div className={`p-4 rounded ${envStatus.supabaseAnonKey ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <div className="font-semibold">
                  {envStatus.supabaseAnonKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {envStatus.anonKeyValue}
                </div>
              </div>
              
              <div className={`p-4 rounded ${envStatus.supabaseServiceKey ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                <div className="font-semibold">
                  {envStatus.supabaseServiceKey ? '✅' : '⚠️'} SUPABASE_SERVICE_ROLE_KEY
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {envStatus.supabaseServiceKey ? 'Set (hidden for security)' : 'Not set (optional for client-side)'}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Next Steps:
                </h3>
                <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                  <li>• If all variables are ✅, go to <a href="/test-migration" className="underline">/test-migration</a></li>
                  <li>• If any are ❌, check your .env.local file</li>
                  <li>• Make sure to restart your dev server after changing env vars</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 