'use client';

import { useState } from 'react';
import { Trophy, BarChart3, Zap, Users, Database, Settings, Calendar, Clock } from 'lucide-react';

interface Operation {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'idle' | 'loading' | 'success' | 'error';
  config?: {
    daysBack?: number;
    daysForward?: number;
    startDate?: string;
    endDate?: string;
  };
}

export default function AdminPage() {
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: 'live-updates',
      name: 'Live Updates',
      description: 'Updates scores and status for live and recent matches. Perfect for keeping scores current during matches.',
      icon: <Clock className="h-5 w-5" />,
      status: 'idle'
    },
    {
      id: 'fixtures',
      name: 'Fetch Fixtures',
      description: 'Retrieves upcoming and live football matches with scores, dates, and match details for all configured leagues.',
      icon: <Trophy className="h-5 w-5" />,
      status: 'idle',
      config: {
        daysBack: 7,
        daysForward: 30
      }
    },
    {
      id: 'standings',
      name: 'Fetch League Standings',
      description: 'Downloads current league standings and table positions for all configured leagues, showing team rankings and points.',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'idle'
    },
    {
      id: 'odds',
      name: 'Fetch Odds',
      description: 'Retrieves betting odds for upcoming matches from various bookmakers.',
      icon: <Zap className="h-5 w-5" />,
      status: 'idle'
    },
    {
      id: 'teams',
      name: 'Update Teams',
      description: 'Updates team information including logos, names, and metadata.',
      icon: <Users className="h-5 w-5" />,
      status: 'idle'
    },
    {
      id: 'static-data',
      name: 'Update Static Data',
      description: 'Updates leagues, countries, and other static reference data.',
      icon: <Database className="h-5 w-5" />,
      status: 'idle'
    }
  ]);

  const [showConfig, setShowConfig] = useState<string | null>(null);

  const executeOperation = async (operation: Operation) => {
    setOperations(prev => prev.map(op => 
      op.id === operation.id ? { ...op, status: 'loading' } : op
    ));

    try {
      let endpoint = '';
      let body: any = {};

      switch (operation.id) {
        case 'live-updates':
          endpoint = '/api/admin/live-updates';
          break;
        case 'fixtures':
          endpoint = '/api/admin/fixtures';
          body = {
            daysBack: operation.config?.daysBack || 7,
            daysForward: operation.config?.daysForward || 30
          };
          break;
        case 'standings':
          endpoint = '/api/admin/standings';
          break;
        case 'odds':
          endpoint = '/api/admin/odds';
          break;
        case 'teams':
          endpoint = '/api/admin/update-teams';
          break;
        case 'static-data':
          endpoint = '/api/admin/static-data';
          body = {
            includeLeagues: true,
            includeCountries: true,
            includeTeams: false,
            includeBookmakers: false,
            includeTvStations: false
          };
          break;
        default:
          throw new Error('Unknown operation');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        const responseText = await response.text();
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (result.success) {
        setOperations(prev => prev.map(op => 
          op.id === operation.id ? { ...op, status: 'success' } : op
        ));
        
        // Reset success status after 3 seconds
        setTimeout(() => {
          setOperations(prev => prev.map(op => 
            op.id === operation.id ? { ...op, status: 'idle' } : op
          ));
        }, 3000);
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error(`Error executing ${operation.name}:`, error);
      
      // Show more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Operation ${operation.name} failed:`, errorMessage);
      
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? { ...op, status: 'error' } : op
      ));
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setOperations(prev => prev.map(op => 
          op.id === operation.id ? { ...op, status: 'idle' } : op
        ));
      }, 5000);
    }
  };

  const updateConfig = (operationId: string, field: string, value: any) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { 
            ...op, 
            config: { 
              ...op.config, 
              [field]: value 
            } 
          } 
        : op
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'loading': return 'Running...';
      case 'success': return 'Completed';
      case 'error': return 'Failed';
      default: return 'Ready';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your football data and API operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map((operation) => (
            <div key={operation.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {operation.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {operation.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {operation.description}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(operation.status)}`} />
              </div>

              {/* Configuration Section */}
              {operation.config && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Configuration
                    </span>
                    <button
                      onClick={() => setShowConfig(showConfig === operation.id ? null : operation.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {showConfig === operation.id ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  {showConfig === operation.id && (
                    <div className="space-y-3">
                      {operation.config.daysBack !== undefined && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Days Back
                          </label>
                          <input
                            type="number"
                            value={operation.config.daysBack || ''}
                            onChange={(e) => updateConfig(operation.id, 'daysBack', parseInt(e.target.value) || 7)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            min="1"
                            max="365"
                          />
                        </div>
                      )}
                      
                      {operation.config.daysForward !== undefined && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Days Forward
                          </label>
                          <input
                            type="number"
                            value={operation.config.daysForward || ''}
                            onChange={(e) => updateConfig(operation.id, 'daysForward', parseInt(e.target.value) || 30)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            min="1"
                            max="365"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  operation.status === 'loading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  operation.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  operation.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {getStatusText(operation.status)}
                </span>
                
                <button
                  onClick={() => executeOperation(operation)}
                  disabled={operation.status === 'loading'}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    operation.status === 'loading'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }`}
                >
                  {operation.status === 'loading' ? 'Running...' : 'Execute'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                const fixturesOp = operations.find(op => op.id === 'fixtures');
                if (fixturesOp) {
                  updateConfig('fixtures', 'daysBack', 30);
                  updateConfig('fixtures', 'daysForward', 30);
                  executeOperation(fixturesOp);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Fetch Last 30 Days</span>
            </button>
            
            <button
              onClick={() => {
                const fixturesOp = operations.find(op => op.id === 'fixtures');
                if (fixturesOp) {
                  updateConfig('fixtures', 'daysBack', 90);
                  updateConfig('fixtures', 'daysForward', 30);
                  executeOperation(fixturesOp);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>Fetch Last 90 Days</span>
            </button>
            
                         <button
               onClick={() => {
                 const fixturesOp = operations.find(op => op.id === 'fixtures');
                 if (fixturesOp) {
                   updateConfig('fixtures', 'daysBack', 90);
                   updateConfig('fixtures', 'daysForward', 30);
                   executeOperation(fixturesOp);
                 }
               }}
               className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
             >
               <Settings className="h-4 w-4" />
               <span>Fetch Last 3 Months</span>
             </button>
            
            <button
              onClick={() => {
                const standingsOp = operations.find(op => op.id === 'standings');
                if (standingsOp) {
                  executeOperation(standingsOp);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Update Standings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 