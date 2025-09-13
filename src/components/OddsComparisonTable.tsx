import React, { useState } from 'react';
import BookmakerLogo from './BookmakerLogo';

interface OddsComparisonTableProps {
  odds: any[];
  homeTeamName: string;
  awayTeamName: string;
}

export default function OddsComparisonTable({ odds, homeTeamName, awayTeamName }: OddsComparisonTableProps) {
  const [sortColumn, setSortColumn] = useState('operator');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedMarket, setSelectedMarket] = useState('1X2');

  // Transform odds data to a cleaner format
  const transformedOdds = odds
    .filter(oddSet => oddSet.Operators && (oddSet.home_win || oddSet.draw || oddSet.away_win))
    .map(oddSet => ({
      operator: oddSet.Operators,
      home: oddSet.home_win ? parseFloat(oddSet.home_win) : null,
      draw: oddSet.draw ? parseFloat(oddSet.draw) : null,
      away: oddSet.away_win ? parseFloat(oddSet.away_win) : null,
    }));

  // Find best odds for highlighting
  const bestOdds = {
    home: Math.max(...transformedOdds.map(o => o.home || 0)),
    draw: Math.max(...transformedOdds.map(o => o.draw || 0)),
    away: Math.max(...transformedOdds.map(o => o.away || 0)),
  };

  // Sort data
  const sortedOdds = [...transformedOdds].sort((a, b) => {
    if (sortColumn === 'operator') {
      const nameA = a.operator.name.toLowerCase();
      const nameB = b.operator.name.toLowerCase();
      return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else {
      const valueA = a[sortColumn as keyof typeof a] || 0;
      const valueB = b[sortColumn as keyof typeof b] || 0;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'operator' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <span className="text-gray-400">↕</span>;
    return sortDirection === 'asc' ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
  };

  if (transformedOdds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg mb-2">🎲</div>
        <div>No betting odds available for this match</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Market Tabs */}
      <div className="bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-600">
        <div className="flex space-x-1 px-4 py-2">
          <button
            onClick={() => setSelectedMarket('1X2')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
              selectedMarket === '1X2'
                ? 'bg-gray-700 dark:bg-gray-700 text-white'
                : 'bg-gray-600 dark:bg-gray-800 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            1X2
          </button>
          <button
            onClick={() => setSelectedMarket('Over/Under')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
              selectedMarket === 'Over/Under'
                ? 'bg-gray-700 dark:bg-gray-700 text-white'
                : 'bg-gray-600 dark:bg-gray-800 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            Over/Under
          </button>
          <button
            onClick={() => setSelectedMarket('Both Teams to Score')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
              selectedMarket === 'Both Teams to Score'
                ? 'bg-gray-700 dark:bg-gray-700 text-white'
                : 'bg-gray-600 dark:bg-gray-800 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            Both Teams to Score
          </button>
          <div className="ml-auto">
            <button className="px-4 py-2 text-sm font-medium rounded-t-lg bg-gray-600 dark:bg-gray-800 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer">
              More
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-gray-600 dark:bg-gray-800 border-b border-gray-500 dark:border-gray-700">
        <div className="flex space-x-1 px-4 py-2">
          <button className="px-4 py-1 text-sm font-medium rounded bg-gray-700 dark:bg-gray-700 text-white focus:outline-none focus:ring-0 focus:border-0 cursor-pointer">
            Full Time
          </button>
          <button className="px-4 py-1 text-sm font-medium rounded bg-gray-500 dark:bg-gray-600 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer">
            1st Half
          </button>
          <button className="px-4 py-1 text-sm font-medium rounded bg-gray-500 dark:bg-gray-600 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer">
            2nd Half
          </button>
          <button className="px-4 py-1 text-sm font-medium rounded bg-yellow-500 text-gray-800 hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer">
            All Bonuses
          </button>
        </div>
      </div>

      {/* Content based on selected market */}
      {selectedMarket === '1X2' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('operator')}
                    className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>Bookmakers</span>
                    <SortIcon column="operator" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort('home')}
                    className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>1</span>
                    <SortIcon column="home" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort('draw')}
                    className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>X</span>
                    <SortIcon column="draw" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort('away')}
                    className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>2</span>
                    <SortIcon column="away" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOdds.map((oddSet, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <BookmakerLogo
                        logoUrl={oddSet.operator.image_path}
                        bookmakerName={oddSet.operator.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {oddSet.operator.name}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-800 text-xs font-medium rounded transition-colors flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>CLAIM BONUS</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={oddSet.operator.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block px-3 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        oddSet.home === bestOdds.home
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {oddSet.home ? oddSet.home.toFixed(2) : '-'}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={oddSet.operator.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block px-3 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        oddSet.draw === bestOdds.draw
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {oddSet.draw ? oddSet.draw.toFixed(2) : '-'}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={oddSet.operator.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block px-3 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        oddSet.away === bestOdds.away
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {oddSet.away ? oddSet.away.toFixed(2) : '-'}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMarket === 'Over/Under' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Bookmakers</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Over 0.5</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Under 0.5</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Over 1.5</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Under 1.5</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Over 2.5</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Under 2.5</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOdds.map((oddSet, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <BookmakerLogo
                        logoUrl={oddSet.operator.image_path}
                        bookmakerName={oddSet.operator.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {oddSet.operator.name}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-800 text-xs font-medium rounded transition-colors flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>CLAIM BONUS</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMarket === 'Both Teams to Score' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Bookmakers</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Yes</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>No</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOdds.map((oddSet, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <BookmakerLogo
                        logoUrl={oddSet.operator.image_path}
                        bookmakerName={oddSet.operator.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {oddSet.operator.name}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-800 text-xs font-medium rounded transition-colors flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>CLAIM BONUS</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


    </div>
  );
}
