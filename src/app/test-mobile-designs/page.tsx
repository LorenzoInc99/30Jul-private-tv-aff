"use client";
import React, { useState } from 'react';

// Mock match data for testing
const mockMatches = [
  {
    id: 1,
    status: 'Live',
    start_time: new Date().toISOString(),
    home_team: { name: 'Manchester United', team_logo_url: 'https://placehold.co/24x24/red/white?text=MU' },
    away_team: { name: 'Liverpool', team_logo_url: 'https://placehold.co/24x24/red/white?text=LIV' },
    home_score: 2,
    away_score: 1,
    Event_Broadcasters: [
      { Broadcasters: { name: 'Sky Sports', logo_url: 'https://placehold.co/24x24/blue/white?text=SKY', affiliate_url: '#' } },
      { Broadcasters: { name: 'BT Sport', logo_url: 'https://placehold.co/24x24/purple/white?text=BT', affiliate_url: '#' } }
    ],
    Odds: [
      { home_win: '2.10', draw: '3.40', away_win: '3.20', Operators: { name: 'Bet365', url: '#' } }
    ]
  },
  {
    id: 2,
    status: 'Not Started',
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    home_team: { name: 'Arsenal', team_logo_url: 'https://placehold.co/24x24/red/white?text=ARS' },
    away_team: { name: 'Chelsea', team_logo_url: 'https://placehold.co/24x24/blue/white?text=CHE' },
    home_score: null,
    away_score: null,
    Event_Broadcasters: [
      { Broadcasters: { name: 'Amazon Prime', logo_url: 'https://placehold.co/24x24/orange/white?text=AMZ', affiliate_url: '#' } }
    ],
    Odds: [
      { home_win: '1.85', draw: '3.60', away_win: '4.20', Operators: { name: 'William Hill', url: '#' } }
    ]
  },
  {
    id: 3,
    status: 'Finished',
    start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    home_team: { name: 'Tottenham', team_logo_url: 'https://placehold.co/24x24/white/navy?text=TOT' },
    away_team: { name: 'West Ham', team_logo_url: 'https://placehold.co/24x24/claret/blue?text=WHU' },
    home_score: 0,
    away_score: 2,
    Event_Broadcasters: [],
    Odds: []
  }
];

// Toggle Component
function ToggleSwitch({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Design 1: Single-Line Layout
function SingleLineDesign({ matches, showOdds, showChannels }: { matches: any[]; showOdds: boolean; showChannels: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Design 1: Single-Line Layout</h3>
        <div className="flex items-center gap-4">
          <ToggleSwitch enabled={showOdds} onToggle={() => {}} label="Odds" />
          <ToggleSwitch enabled={showChannels} onToggle={() => {}} label="Channels" />
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {matches.map((match) => {
          const isLive = match.status === 'Live';
          const getStatusText = () => {
            if (match.status === 'Finished') return 'FT';
            if (isLive) return 'LIVE';
            return new Date(match.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          };

          return (
            <div key={match.id} className="relative">
              {isLive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              )}
              
              <div className={`flex items-center justify-between p-3 gap-2 ${isLive ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                {/* Time/Status */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className={`text-xs font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {getStatusText()}
                  </span>
                </div>

                {/* Teams */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <img src={match.home_team.team_logo_url} alt="" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                      {match.home_team.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">vs</span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                      {match.away_team.name}
                    </span>
                    <img src={match.away_team.team_logo_url} alt="" className="w-6 h-6 object-contain" />
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center justify-center w-8">
                  {match.home_score !== null ? (
                    <>
                      <span className={`text-sm font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                        {match.home_score}
                      </span>
                      <span className={`text-sm font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                        {match.away_score}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-400">-</span>
                      <span className="text-sm text-gray-400">-</span>
                    </>
                  )}
                </div>

                {/* Odds (toggleable) */}
                {showOdds && match.status !== 'Finished' && (
                  <div className="flex items-center gap-1">
                    {[
                      { key: 'home', value: match.Odds[0]?.home_win },
                      { key: 'draw', value: match.Odds[0]?.draw },
                      { key: 'away', value: match.Odds[0]?.away_win }
                    ].map(({ key, value }) => (
                      <div key={key} className="flex flex-col items-center justify-center text-center w-8 h-8 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {value ? parseFloat(value).toFixed(1) : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Channels (toggleable) */}
                {showChannels && match.Event_Broadcasters.length > 0 && (
                  <div className="flex items-center gap-1">
                    {match.Event_Broadcasters.slice(0, 2).map((eb: any, idx: number) => (
                      <div key={idx} className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          {eb.Broadcasters.name.charAt(0)}
                        </span>
                      </div>
                    ))}
                    {match.Event_Broadcasters.length > 2 && (
                      <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          +{match.Event_Broadcasters.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Design 2: Two-Line Layout
function TwoLineDesign({ matches, showOdds, showChannels }: { matches: any[]; showOdds: boolean; showChannels: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Design 2: Two-Line Layout</h3>
        <div className="flex items-center gap-4">
          <ToggleSwitch enabled={showOdds} onToggle={() => {}} label="Odds" />
          <ToggleSwitch enabled={showChannels} onToggle={() => {}} label="Channels" />
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {matches.map((match) => {
          const isLive = match.status === 'Live';
          const getStatusText = () => {
            if (match.status === 'Finished') return 'FT';
            if (isLive) return 'LIVE';
            return new Date(match.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          };

          return (
            <div key={match.id} className="relative">
              {isLive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              )}
              
              <div className={`p-3 ${isLive ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                {/* Line 1: Time, Teams, Score */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className={`text-xs font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {getStatusText()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <img src={match.home_team.team_logo_url} alt="" className="w-6 h-6 object-contain" />
                      <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {match.home_team.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">vs</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {match.away_team.name}
                      </span>
                      <img src={match.away_team.team_logo_url} alt="" className="w-6 h-6 object-contain" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center w-8">
                    {match.home_score !== null ? (
                      <>
                        <span className={`text-sm font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                          {match.home_score}
                        </span>
                        <span className={`text-sm font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                          {match.away_score}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-400">-</span>
                        <span className="text-sm text-gray-400">-</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Line 2: Odds and/or Channels (toggleable) */}
                {(showOdds || showChannels) && (
                  <div className="flex items-center gap-4">
                    {showOdds && match.status !== 'Finished' && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Odds:</span>
                        {[
                          { key: 'home', value: match.Odds[0]?.home_win },
                          { key: 'draw', value: match.Odds[0]?.draw },
                          { key: 'away', value: match.Odds[0]?.away_win }
                        ].map(({ key, value }) => (
                          <div key={key} className="flex flex-col items-center justify-center text-center w-8 h-8 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                              {value ? parseFloat(value).toFixed(1) : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {showChannels && match.Event_Broadcasters.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">TV:</span>
                        {match.Event_Broadcasters.slice(0, 3).map((eb: any, idx: number) => (
                          <div key={idx} className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                              {eb.Broadcasters.name.charAt(0)}
                            </span>
                          </div>
                        ))}
                        {match.Event_Broadcasters.length > 3 && (
                          <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                              +{match.Event_Broadcasters.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Design 3: Card-Based Layout
function CardBasedDesign({ matches, showOdds, showChannels }: { matches: any[]; showOdds: boolean; showChannels: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Design 3: Card-Based Layout</h3>
        <div className="flex items-center gap-4">
          <ToggleSwitch enabled={showOdds} onToggle={() => {}} label="Odds" />
          <ToggleSwitch enabled={showChannels} onToggle={() => {}} label="Channels" />
        </div>
      </div>
      
      <div className="p-3 space-y-3">
        {matches.map((match) => {
          const isLive = match.status === 'Live';
          const getStatusText = () => {
            if (match.status === 'Finished') return 'FT';
            if (isLive) return 'LIVE';
            return new Date(match.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          };

          return (
            <div key={match.id} className={`relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
              isLive ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-900'
            }`}>
              {isLive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              )}
              
              <div className="p-3">
                {/* Main content line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className={`text-xs font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {getStatusText()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <img src={match.home_team.team_logo_url} alt="" className="w-6 h-6 object-contain" />
                      <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {match.home_team.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">vs</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {match.away_team.name}
                      </span>
                      <img src={match.away_team.team_logo_url} alt="" className="w-6 h-6 object-contain" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center w-8">
                    {match.home_score !== null ? (
                      <>
                        <span className={`text-sm font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                          {match.home_score}
                        </span>
                        <span className={`text-sm font-bold ${isLive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                          {match.away_score}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-400">-</span>
                        <span className="text-sm text-gray-400">-</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional info line (toggleable) */}
                {(showOdds || showChannels) && (
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {showOdds && match.status !== 'Finished' && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Odds:</span>
                        {[
                          { key: 'home', value: match.Odds[0]?.home_win },
                          { key: 'draw', value: match.Odds[0]?.draw },
                          { key: 'away', value: match.Odds[0]?.away_win }
                        ].map(({ key, value }) => (
                          <div key={key} className="flex flex-col items-center justify-center text-center w-8 h-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                              {value ? parseFloat(value).toFixed(1) : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {showChannels && match.Event_Broadcasters.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">TV:</span>
                        {match.Event_Broadcasters.slice(0, 3).map((eb: any, idx: number) => (
                          <div key={idx} className="w-6 h-6 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                              {eb.Broadcasters.name.charAt(0)}
                            </span>
                          </div>
                        ))}
                        {match.Event_Broadcasters.length > 3 && (
                          <div className="w-6 h-6 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                              +{match.Event_Broadcasters.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TestMobileDesignsPage() {
  const [showOdds, setShowOdds] = useState(false);
  const [showChannels, setShowChannels] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mobile Design Comparison</h1>
          <p className="text-gray-600 dark:text-gray-400">Compare three different mobile layouts for match cards</p>
        </div>

        {/* Global Toggles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Global Toggles</h2>
          <div className="flex items-center gap-6">
            <ToggleSwitch enabled={showOdds} onToggle={() => setShowOdds(!showOdds)} label="Show Odds" />
            <ToggleSwitch enabled={showChannels} onToggle={() => setShowChannels(!showChannels)} label="Show Channels" />
          </div>
        </div>

        {/* Design Comparisons */}
        <div className="grid gap-6">
          <SingleLineDesign matches={mockMatches} showOdds={showOdds} showChannels={showChannels} />
          <TwoLineDesign matches={mockMatches} showOdds={showOdds} showChannels={showChannels} />
          <CardBasedDesign matches={mockMatches} showOdds={showOdds} showChannels={showChannels} />
        </div>

        {/* Current Design for Reference */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Design (for reference)</h3>
          </div>
          <div className="p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>This shows your current mobile layout for comparison.</p>
              <p className="mt-2">Key differences:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Time and TV icon on top row</li>
                <li>Teams, odds, and score on bottom row</li>
                <li>No toggle functionality</li>
                <li>Less clear separation between matches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







