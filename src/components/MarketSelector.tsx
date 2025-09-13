'use client';

import React from 'react';
import { AccumulatorSelection } from '../lib/interfaces/accumulator';
import { getBestOddsFromTransformed } from '../lib/database-adapter';
import TeamLogo from './TeamLogo';

interface MarketSelectorProps {
  selections: AccumulatorSelection[];
  onSelectionChange: (selections: AccumulatorSelection[]) => void;
}

export default function MarketSelector({ selections, onSelectionChange }: MarketSelectorProps) {
  const handleMarketChange = (matchId: string, market: 'home' | 'draw' | 'away') => {
    const updatedSelections = selections.map(selection => {
      if (selection.matchId === matchId) {
        const bestOdds = getBestOddsFromTransformed(selection.match.Odds || []);
        let newOdds = 2.0;
        let newOperator = { id: 1, name: 'Unknown', url: '#', logo_url: null };

        switch (market) {
          case 'home':
            newOdds = bestOdds.home?.value || 2.0;
            newOperator = bestOdds.home?.operator || { id: 1, name: 'Unknown', url: '#', logo_url: null };
            break;
          case 'draw':
            newOdds = bestOdds.draw?.value || 3.0;
            newOperator = bestOdds.draw?.operator || { id: 1, name: 'Unknown', url: '#', logo_url: null };
            break;
          case 'away':
            newOdds = bestOdds.away?.value || 2.0;
            newOperator = bestOdds.away?.operator || { id: 1, name: 'Unknown', url: '#', logo_url: null };
            break;
        }

        return {
          ...selection,
          selectedMarket: market,
          selectedOdds: newOdds,
          operator: newOperator
        };
      }
      return selection;
    });

    onSelectionChange(updatedSelections);
  };

  const getMarketOdds = (match: any, market: 'home' | 'draw' | 'away') => {
    const bestOdds = getBestOddsFromTransformed(match.Odds || []);
    switch (market) {
      case 'home':
        return bestOdds.home;
      case 'draw':
        return bestOdds.draw;
      case 'away':
        return bestOdds.away;
      default:
        return null;
    }
  };

  const getMarketLabel = (market: 'home' | 'draw' | 'away', match: any) => {
    switch (market) {
      case 'home':
        return match.home_team?.name || 'Home';
      case 'draw':
        return 'Draw';
      case 'away':
        return match.away_team?.name || 'Away';
      default:
        return '';
    }
  };

  const getMarketColor = (market: 'home' | 'draw' | 'away') => {
    switch (market) {
      case 'home':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'draw':
        return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
      case 'away':
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const getMarketTextColor = (market: 'home' | 'draw' | 'away') => {
    switch (market) {
      case 'home':
        return 'text-blue-900 dark:text-blue-100';
      case 'draw':
        return 'text-gray-900 dark:text-gray-100';
      case 'away':
        return 'text-red-900 dark:text-red-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  if (selections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>No matches selected yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Choose your predicted outcome for each match. The system will find which operator offers the best total odds for your combination.
      </div>

      {selections.map((selection) => {
        const match = selection.match;
        const homeOdds = getMarketOdds(match, 'home');
        const drawOdds = getMarketOdds(match, 'draw');
        const awayOdds = getMarketOdds(match, 'away');

        return (
          <div
            key={selection.matchId}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
          >
            {/* Match Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TeamLogo
                  logoUrl={match.home_team?.team_logo_url}
                  teamName={match.home_team?.name || 'Home'}
                  size="sm"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {match.home_team?.name || 'Home Team'}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">vs</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {match.away_team?.name || 'Away Team'}
                </span>
                <TeamLogo
                  logoUrl={match.away_team?.team_logo_url}
                  teamName={match.away_team?.name || 'Away'}
                  size="sm"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(match.start_time).toLocaleDateString('en-GB', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </div>
            </div>

            {/* Market Selection */}
            <div className="grid grid-cols-3 gap-3">
              {(['home', 'draw', 'away'] as const).map((market) => {
                const isSelected = selection.selectedMarket === market;
                const marketOdds = getMarketOdds(match, market);
                const marketLabel = getMarketLabel(market, match);

                return (
                  <button
                    key={market}
                    onClick={() => handleMarketChange(selection.matchId, market)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? `${getMarketColor(market)} border-current`
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`text-center ${isSelected ? getMarketTextColor(market) : 'text-gray-700 dark:text-gray-300'}`}>
                      <div className="font-semibold text-sm mb-1">
                        {marketLabel}
                      </div>
                      <div className="text-lg font-bold">
                        {marketOdds?.value ? marketOdds.value.toFixed(2) : 'N/A'}
                      </div>
                      <div className="text-xs opacity-75">
                        {marketOdds?.operator?.name || 'N/A'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selection Summary */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-semibold">{getMarketLabel(selection.selectedMarket, match)}</span>
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Odds: {selection.selectedOdds.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                via {selection.operator.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Odds Preview */}
      {selections.length >= 2 && (
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
              Current Selection Total
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {selections.reduce((total, selection) => total * selection.selectedOdds, 1).toFixed(2)}
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">
              {selections.length} matches selected
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
