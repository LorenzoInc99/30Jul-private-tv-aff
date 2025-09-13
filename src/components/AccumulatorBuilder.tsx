'use client';

import React, { useState, useMemo } from 'react';
import { Match, Operator } from '../lib/interfaces/accumulator';
import MatchSelector from './MatchSelector';
import MarketSelector from './MarketSelector';
import OperatorComparison from './OperatorComparison';

export interface AccumulatorSelection {
  matchId: string;
  match: Match;
  selectedMarket: 'home' | 'draw' | 'away';
  selectedOdds: number;
  operator: Operator;
}

interface AccumulatorBuilderProps {
  matches: Match[];
  onClose?: () => void;
}

export default function AccumulatorBuilder({ matches, onClose }: AccumulatorBuilderProps) {
  const [selectedMatches, setSelectedMatches] = useState<AccumulatorSelection[]>([]);
  const [stake, setStake] = useState<number>(10);

  // Calculate operator comparisons when selections change
  const operatorComparisons = useMemo(() => {
    if (selectedMatches.length < 2) return [];
    
    // Group selections by operator and calculate totals
    const operatorMap = new Map<string, {
      operator: Operator;
      selections: AccumulatorSelection[];
      totalOdds: number;
      potentialReturn: number;
    }>();

    selectedMatches.forEach(selection => {
      const operatorId = selection.operator.id.toString();
      const existing = operatorMap.get(operatorId);
      
      if (existing) {
        existing.selections.push(selection);
        existing.totalOdds *= selection.selectedOdds;
      } else {
        operatorMap.set(operatorId, {
          operator: selection.operator,
          selections: [selection],
          totalOdds: selection.selectedOdds,
          potentialReturn: stake * selection.selectedOdds
        });
      }
    });

    // Convert to array and sort by total odds (highest first)
    return Array.from(operatorMap.values())
      .map(item => ({
        ...item,
        potentialReturn: stake * item.totalOdds
      }))
      .sort((a, b) => b.totalOdds - a.totalOdds)
      .map((item, index) => ({
        ...item,
        ranking: index + 1
      }));
  }, [selectedMatches, stake]);

  const handleMatchSelection = (selections: AccumulatorSelection[]) => {
    setSelectedMatches(selections);
  };

  const handleStakeChange = (newStake: number) => {
    setStake(newStake);
  };

  const isReady = selectedMatches.length >= 2;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎯 Multi-Match Accumulator Builder
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select multiple matches and see which operator offers the best total odds for your accumulator.
          Perfect for finding the best value when betting on multiple games with the same bookmaker.
        </p>
      </div>

      {/* Match Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📋 Select Matches ({selectedMatches.length}/10)
        </h3>
        <MatchSelector
          matches={matches}
          onSelectionChange={handleMatchSelection}
          selectedMatches={selectedMatches}
        />
      </div>

      {/* Market Selection */}
      {selectedMatches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎲 Choose Your Markets
          </h3>
          <MarketSelector
            selections={selectedMatches}
            onSelectionChange={setSelectedMatches}
          />
        </div>
      )}

      {/* Stake Input */}
      {isReady && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💰 Stake Amount
          </h3>
          <div className="flex items-center gap-4">
            <label className="text-gray-700 dark:text-gray-300">Stake:</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => handleStakeChange(Number(e.target.value))}
              min="1"
              step="1"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400">GBP</span>
          </div>
        </div>
      )}

      {/* Operator Comparison */}
      {isReady && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🏆 Operator Comparison
          </h3>
          <OperatorComparison
            comparisons={operatorComparisons}
            stake={stake}
            selections={selectedMatches}
          />
        </div>
      )}

      {/* Instructions */}
      {!isReady && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <p>Select at least 2 matches to start building your accumulator</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 How It Works
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 text-left space-y-1">
              <li>• Select 2-10 matches you want to bet on</li>
              <li>• Choose Home/Draw/Away for each match</li>
              <li>• See which operator offers the best total odds</li>
              <li>• Click through to place your accumulator bet</li>
            </ul>
          </div>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
