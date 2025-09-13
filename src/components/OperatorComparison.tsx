'use client';

import React from 'react';
import { AccumulatorSelection } from '../lib/interfaces/accumulator';

interface OperatorComparisonProps {
  comparisons: Array<{
    operator: {
      id: number;
      name: string;
      url: string;
      logo_url?: string | null;
    };
    totalOdds: number;
    potentialReturn: number;
    ranking: number;
  }>;
  stake: number;
  selections: AccumulatorSelection[];
}

export default function OperatorComparison({ comparisons, stake, selections }: OperatorComparisonProps) {
  if (comparisons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No operator comparisons available</p>
      </div>
    );
  }

  const bestOperator = comparisons[0];
  const totalSelections = selections.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const handleOperatorClick = (operatorUrl: string, operatorName: string) => {
    // Open operator URL in new tab
    window.open(operatorUrl, '_blank', 'noopener,noreferrer');
    
    // You could also track this click for analytics
    console.log(`User clicked through to ${operatorName}`);
  };

  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${ranking}.`;
    }
  };

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">
          🏆 Best Value Found!
        </h3>
        <p className="text-green-100 mb-3">
          {bestOperator.operator.name} offers the highest total odds for your {totalSelections}-match accumulator
        </p>
        <div className="text-3xl font-bold text-green-100">
          {bestOperator.totalOdds.toFixed(2)}
        </div>
        <div className="text-sm text-green-200">
          Total odds • {formatCurrency(stake)} stake = {formatCurrency(bestOperator.potentialReturn)} return
        </div>
      </div>

      {/* Operator Rankings */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Operator Rankings by Total Odds
        </h4>
        
        {comparisons.map((comparison) => {
          const isBest = comparison.ranking === 1;
          const selectionBreakdown = selections.map(selection => {
            const marketLabel = selection.selectedMarket === 'home' 
              ? selection.match.home_team?.name 
              : selection.selectedMarket === 'away' 
                ? selection.match.away_team?.name 
                : 'Draw';
            return `${marketLabel} (${selection.selectedOdds.toFixed(2)})`;
          }).join(' + ');

          return (
            <div
              key={comparison.operator.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isBest 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Ranking Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankingColor(comparison.ranking)}`}>
                    {getRankingIcon(comparison.ranking)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      {comparison.operator.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ranking #{comparison.ranking} of {comparisons.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {comparison.totalOdds.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Odds
                  </div>
                </div>
              </div>

              {/* Selection Breakdown */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Your Selection:
                </div>
                <div className="text-sm text-gray-900 dark:text-white font-mono">
                  {selectionBreakdown}
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stake</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stake)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Potential Return</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(comparison.potentialReturn)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Potential Profit:</span>{' '}
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(comparison.potentialReturn - stake)}
                  </span>
                </div>
                <button
                  onClick={() => handleOperatorClick(comparison.operator.url, comparison.operator.name)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    isBest
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isBest ? '🎯 Bet with Best Operator' : 'Bet with ' + comparison.operator.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 How This Works
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• We calculate total odds for each operator across all your selected matches</li>
          <li>• Operators are ranked by total odds (highest first)</li>
          <li>• Click through to place your accumulator bet with your chosen operator</li>
          <li>• All odds are live and updated in real-time</li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>
          Odds are subject to change. Please verify all odds and terms with the operator before placing your bet.
          Gambling can be addictive. Please bet responsibly.
        </p>
      </div>
    </div>
  );
}
