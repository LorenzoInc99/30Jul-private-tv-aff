'use client';

import React, { useState } from 'react';
import { AccumulatorSelection } from '../lib/interfaces/accumulator';
import { getBestOddsFromTransformed } from '../lib/database-adapter';
import TeamLogo from './TeamLogo';
import LeagueLogo from './LeagueLogo';

interface MatchSelectorProps {
  matches: any[];
  onSelectionChange: (selections: AccumulatorSelection[]) => void;
  selectedMatches: AccumulatorSelection[];
}

export default function MatchSelector({ matches, onSelectionChange, selectedMatches }: MatchSelectorProps) {
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());

  // Filter out finished matches and only show upcoming ones
  const upcomingMatches = matches.filter(match => {
    const matchDate = new Date(match.start_time);
    const now = new Date();
    return matchDate > now && match.status !== 'Finished' && match.status !== 'Full Time';
  });

  const handleMatchToggle = (match: any, isSelected: boolean) => {
    if (isSelected) {
      // Remove match from selection
      const newSelections = selectedMatches.filter(s => s.matchId !== match.id);
      onSelectionChange(newSelections);
    } else {
      // Add match to selection (with default home market)
      if (selectedMatches.length >= 10) {
        alert('You can select a maximum of 10 matches');
        return;
      }

      const bestOdds = getBestOddsFromTransformed(match.Odds || []);
      const defaultSelection: AccumulatorSelection = {
        matchId: match.id,
        match: match,
        selectedMarket: 'home',
        selectedOdds: bestOdds.home?.value || 2.0,
        operator: bestOdds.home?.operator || { id: 1, name: 'Unknown', url: '#', logo_url: null }
      };

      const newSelections = [...selectedMatches, defaultSelection];
      onSelectionChange(newSelections);
    }
  };

  const isMatchSelected = (matchId: string) => {
    return selectedMatches.some(s => s.matchId === matchId);
  };

  const toggleExpanded = (matchId: string) => {
    const newExpanded = new Set(expandedMatches);
    if (newExpanded.has(matchId)) {
      newExpanded.delete(matchId);
    } else {
      newExpanded.add(matchId);
    }
    setExpandedMatches(newExpanded);
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (upcomingMatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No upcoming matches available for selection</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selection Counter */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedMatches.length} of {upcomingMatches.length} matches available
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Select 2-10 matches
        </span>
      </div>

      {/* Matches List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {upcomingMatches.map((match) => {
          const isSelected = isMatchSelected(match.id);
          const bestOdds = getBestOddsFromTransformed(match.Odds || []);
          const isExpanded = expandedMatches.has(match.id);

          return (
            <div
              key={match.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Match Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleMatchToggle(match, e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center gap-2">
                    {match.Competitions?.league_logo && (
                      <LeagueLogo
                        logoUrl={match.Competitions.league_logo}
                        leagueName={match.Competitions?.name || 'Unknown'}
                        leagueId={match.Competitions?.id}
                        size="sm"
                        className="w-5 h-5"
                      />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {match.Competitions?.name || 'Unknown League'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatMatchDate(match.start_time)}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatMatchTime(match.start_time)}
                  </span>
                  <button
                    onClick={() => toggleExpanded(match.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TeamLogo
                    logoUrl={match.home_team?.team_logo_url}
                    teamName={match.home_team?.name || 'Home'}
                    size="sm"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {match.home_team?.name || 'Home Team'}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-medium">vs</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {match.away_team?.name || 'Away Team'}
                  </span>
                  <TeamLogo
                    logoUrl={match.away_team?.team_logo_url}
                    teamName={match.away_team?.name || 'Away'}
                    size="sm"
                  />
                </div>
              </div>

              {/* Odds Preview */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Best odds available:
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Home</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {bestOdds.home?.value ? bestOdds.home.value.toFixed(2) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {bestOdds.home?.operator?.name || 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1 text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Draw</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {bestOdds.draw?.value ? bestOdds.draw.value.toFixed(2) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {bestOdds.draw?.operator?.name || 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1 text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Away</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {bestOdds.away?.value ? bestOdds.away.value.toFixed(2) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {bestOdds.away?.operator?.name || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedMatches.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-200">
            <span className="font-semibold">{selectedMatches.length} matches selected</span>
            {selectedMatches.length >= 2 && (
              <span> - Ready to compare operators!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
