'use client';

import { useState } from 'react';
import CountryFlag from '../../components/CountryFlag';
import TeamLogo from '../../components/TeamLogo';
import BroadcasterLogo from '../../components/BroadcasterLogo';

// Mock data for the design demonstration
const mockCompetitions = [
  {
    id: 1,
    name: 'UEFA Champions League, Playoff Round',
    country: { name: 'Europe', image_path: '/flags/europe.svg' },
    matches: [
      {
        id: '1',
        start_time: '2024-01-15T18:45:00Z',
        status: 'Penalties',
        home_team: { name: 'Kairat', team_logo_url: 'https://via.placeholder.com/32x32/ffd700/000000?text=K' },
        away_team: { name: 'Celtic', team_logo_url: 'https://via.placeholder.com/32x32/00ff00/000000?text=C' },
        home_score: 0,
        away_score: 0,
        Odds: [
          { home: { value: '5.75', operator: { name: 'Bet365', url: '#' } }, draw: { value: '3.40', operator: { name: 'Bet365', url: '#' } }, away: { value: '1.50', operator: { name: 'Bet365', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'TNT Sports', logo_url: 'https://via.placeholder.com/24x24/ff6b35/ffffff?text=TNT', affiliate_url: '#' } },
          { Broadcasters: { name: 'CBS Sports', logo_url: 'https://via.placeholder.com/24x24/1e40af/ffffff?text=CBS', affiliate_url: '#' } },
          { Broadcasters: { name: 'DAZN', logo_url: 'https://via.placeholder.com/24x24/000000/ffffff?text=DAZN', affiliate_url: '#' } },
          { Broadcasters: { name: 'ESPN+', logo_url: 'https://via.placeholder.com/24x24/ff0000/ffffff?text=ESPN', affiliate_url: '#' } },
          { Broadcasters: { name: 'Paramount+', logo_url: 'https://via.placeholder.com/24x24/0066cc/ffffff?text=PAR', affiliate_url: '#' } }
        ]
      },
      {
        id: '2',
        start_time: '2024-01-15T21:00:00Z',
        status: '1st Half',
        home_team: { name: 'Pafos', team_logo_url: 'https://via.placeholder.com/32x32/0000ff/ffffff?text=P' },
        away_team: { name: 'Crvena zv...', team_logo_url: 'https://via.placeholder.com/32x32/ff0000/ffffff?text=CZ' },
        home_score: 0,
        away_score: 0,
        Odds: [
          { home: { value: '3.40', operator: { name: 'William Hill', url: '#' } }, draw: { value: '3.90', operator: { name: 'William Hill', url: '#' } }, away: { value: '1.95', operator: { name: 'William Hill', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'TNT Sports', logo_url: 'https://via.placeholder.com/24x24/ff6b35/ffffff?text=TNT', affiliate_url: '#' } },
          { Broadcasters: { name: 'CBS Sports', logo_url: 'https://via.placeholder.com/24x24/1e40af/ffffff?text=CBS', affiliate_url: '#' } }
        ]
      },
      {
        id: '3',
        start_time: '2024-01-15T21:00:00Z',
        status: '1st Half',
        home_team: { name: 'Sturm', team_logo_url: 'https://via.placeholder.com/32x32/000000/ffffff?text=S' },
        away_team: { name: 'Bodø/Glimt', team_logo_url: 'https://via.placeholder.com/32x32/ffff00/000000?text=BG' },
        home_score: 0,
        away_score: 1,
        Odds: [
          { home: { value: '2.15', operator: { name: 'Bet365', url: '#' } }, draw: { value: '3.70', operator: { name: 'Bet365', url: '#' } }, away: { value: '3.10', operator: { name: 'Bet365', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'TNT Sports', logo_url: 'https://via.placeholder.com/24x24/ff6b35/ffffff?text=TNT', affiliate_url: '#' } },
          { Broadcasters: { name: 'CBS Sports', logo_url: 'https://via.placeholder.com/24x24/1e40af/ffffff?text=CBS', affiliate_url: '#' } },
          { Broadcasters: { name: 'DAZN', logo_url: 'https://via.placeholder.com/24x24/000000/ffffff?text=DAZN', affiliate_url: '#' } }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Brasileirão Betano',
    country: { name: 'Brazil', image_path: '/flags/brazil.svg' },
    matches: [
      {
        id: '4',
        start_time: '2024-01-15T00:00:00Z',
        status: 'Finished',
        home_team: { name: 'Palmeiras', team_logo_url: 'https://via.placeholder.com/32x32/00ff00/000000?text=PAL' },
        away_team: { name: 'Sport', team_logo_url: 'https://via.placeholder.com/32x32/ff0000/ffffff?text=SPT' },
        home_score: 3,
        away_score: 0,
        Odds: [
          { home: { value: '1.29', operator: { name: 'Bet365', url: '#' } }, draw: { value: '5.25', operator: { name: 'Bet365', url: '#' } }, away: { value: '10.00', operator: { name: 'Bet365', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'Globo', logo_url: 'https://via.placeholder.com/24x24/0000ff/ffffff?text=GLO', affiliate_url: '#' } },
          { Broadcasters: { name: 'ESPN Brasil', logo_url: 'https://via.placeholder.com/24x24/ff0000/ffffff?text=ESP', affiliate_url: '#' } },
          { Broadcasters: { name: 'Premiere', logo_url: 'https://via.placeholder.com/24x24/ffd700/000000?text=PRE', affiliate_url: '#' } }
        ]
      },
      {
        id: '5',
        start_time: '2024-01-15T02:00:00Z',
        status: 'Finished',
        home_team: { name: 'Flamengo', team_logo_url: 'https://via.placeholder.com/32x32/ff0000/ffffff?text=FLA' },
        away_team: { name: 'Vitória', team_logo_url: 'https://via.placeholder.com/32x32/000000/ffffff?text=VIT' },
        home_score: 8,
        away_score: 0,
        Odds: [
          { home: { value: '1.18', operator: { name: 'William Hill', url: '#' } }, draw: { value: '6.50', operator: { name: 'William Hill', url: '#' } }, away: { value: '17.00', operator: { name: 'William Hill', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'Globo', logo_url: 'https://via.placeholder.com/24x24/0000ff/ffffff?text=GLO', affiliate_url: '#' } },
          { Broadcasters: { name: 'ESPN Brasil', logo_url: 'https://via.placeholder.com/24x24/ff0000/ffffff?text=ESP', affiliate_url: '#' } }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'EFL Cup',
    country: { name: 'England', image_path: '/flags/england.svg' },
    matches: [
      {
        id: '6',
        start_time: '2024-01-15T20:00:00Z',
        status: '2nd Half',
        home_team: { name: 'Reading', team_logo_url: 'https://via.placeholder.com/32x32/0000ff/ffffff?text=REA' },
        away_team: { name: 'Wimbledon', team_logo_url: 'https://via.placeholder.com/32x32/ffd700/000000?text=WIM' },
        home_score: 1,
        away_score: 1,
        Odds: [
          { home: { value: '2.60', operator: { name: 'Bet365', url: '#' } }, draw: { value: '3.10', operator: { name: 'Bet365', url: '#' } }, away: { value: '2.80', operator: { name: 'Bet365', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'Sky Sports', logo_url: 'https://via.placeholder.com/24x24/000000/ffffff?text=SKY', affiliate_url: '#' } },
          { Broadcasters: { name: 'ESPN+', logo_url: 'https://via.placeholder.com/24x24/ff0000/ffffff?text=ESPN', affiliate_url: '#' } }
        ]
      },
      {
        id: '7',
        start_time: '2024-01-15T20:30:00Z',
        status: 'Not Started',
        home_team: { name: 'Cambridge', team_logo_url: 'https://via.placeholder.com/32x32/ffff00/000000?text=CAM' },
        away_team: { name: 'Charlton', team_logo_url: 'https://via.placeholder.com/32x32/ff0000/ffffff?text=CHA' },
        home_score: null,
        away_score: null,
        Odds: [
          { home: { value: '3.25', operator: { name: 'William Hill', url: '#' } }, draw: { value: '3.30', operator: { name: 'William Hill', url: '#' } }, away: { value: '2.15', operator: { name: 'William Hill', url: '#' } } }
        ],
        Event_Broadcasters: [
          { Broadcasters: { name: 'Sky Sports', logo_url: 'https://via.placeholder.com/24x24/000000/ffffff?text=SKY', affiliate_url: '#' } }
        ]
      }
    ]
  }
];

// Enhanced Match Card Component for the mockup
function EnhancedMatchCard({ match, showOdds }: { match: any; showOdds: boolean }) {
  const isLive = match.status === '1st Half' || match.status === '2nd Half' || match.status === 'Half Time';
  const isFinished = match.status === 'Finished';
  const isUpcoming = match.status === 'Not Started';

  const getTimeDisplay = () => {
    if (isFinished) return 'FT';
    if (isLive) return '18:45';
    if (isUpcoming) return '21:00';
    return '20:00';
  };

  const getStatusDisplay = () => {
    if (isFinished) return 'FT';
    if (isLive) {
      // Different minute indicators for different matches to simulate real data
      if (match.id === '2') return "25'";
      if (match.id === '3') return "24'";
      if (match.id === '6') return "68'";
      return "25'";
    }
    if (isUpcoming) return '-';
    return '-';
  };

  const getBestOdds = () => {
    if (!match.Odds || match.Odds.length === 0) return null;
    return match.Odds[0]; // Simplified for mockup
  };

  const getBroadcasters = () => {
    if (!match.Event_Broadcasters) return [];
    return match.Event_Broadcasters.filter((eb: any) => eb.Broadcasters?.name);
  };

  const odds = getBestOdds();
  const broadcasters = getBroadcasters();

  return (
    <div className={`w-full transition-all duration-200 cursor-pointer relative hover:bg-gray-100 dark:hover:bg-gray-700 ${
      isLive ? 'border-l-4 border-l-red-500' : ''
    }`}>
      <div className="flex items-center p-2 gap-2">
        {/* Time Column - Compact and close to border */}
        <div className="flex-shrink-0 w-12 flex flex-col items-start">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {getTimeDisplay()}
          </span>
          <span className={`text-xs font-medium ${
            isLive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {getStatusDisplay()}
          </span>
        </div>

        {/* Teams Column - Two rows, closer together */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex-shrink-0">
              <img 
                src={match.home_team.team_logo_url} 
                alt={match.home_team.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className={`text-sm truncate ${
              isLive ? 'text-gray-900 dark:text-white font-normal' :
              isFinished && match.home_score > match.away_score ? 'font-black text-gray-900 dark:text-white' :
              'font-light text-gray-500 dark:text-gray-400'
            }`}>
              {match.home_team.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex-shrink-0">
              <img 
                src={match.away_team.team_logo_url} 
                alt={match.away_team.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className={`text-sm truncate ${
              isLive ? 'text-gray-900 dark:text-white font-normal' :
              isFinished && match.away_score > match.home_score ? 'font-black text-gray-900 dark:text-white' :
              'font-light text-gray-500 dark:text-gray-400'
            }`}>
              {match.away_team.name}
            </span>
          </div>
        </div>

        {/* Dynamic Right Column - Odds or TV Channels */}
        <div className="flex-shrink-0 w-15 mr-8">
          {!showOdds ? (
            // Odds Mode
            <div className="flex gap-1">
              {odds ? (
                <>
                  <div className={`flex-1 text-center py-1 px-0.5 rounded text-xs font-bold ${
                    isFinished && match.home_score > match.away_score ? 
                    'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {parseFloat(odds.home.value).toFixed(2)}
                  </div>
                  <div className="flex-1 text-center py-1 px-0.5 rounded text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {parseFloat(odds.draw.value).toFixed(2)}
                  </div>
                  <div className={`flex-1 text-center py-1 px-0.5 rounded text-xs font-bold ${
                    isFinished && match.away_score > match.home_score ? 
                    'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {parseFloat(odds.away.value).toFixed(2)}
                  </div>
                </>
              ) : (
                <div className="flex-1 text-center py-1 text-xs text-gray-400">N/A</div>
              )}
            </div>
          ) : (
            // TV Channels Mode
            <div className="flex items-center gap-1">
              {broadcasters.slice(0, 3).map((eb: any, idx: number) => (
                <div key={idx} className="w-5 h-5 flex-shrink-0">
                  <img 
                    src={eb.Broadcasters.logo_url} 
                    alt={eb.Broadcasters.name}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              ))}
              {broadcasters.length > 3 && (
                <div className="w-5 h-5 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    +{broadcasters.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score Column */}
        <div className="flex-shrink-0 w-8 text-center flex flex-col gap-0.5">
          {match.home_score !== null && match.away_score !== null ? (
            <>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {match.home_score}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
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

        {/* Favorite Star */}
        <div className="flex-shrink-0 w-6 flex justify-center">
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442c.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DesignMockupPage() {
  const [showOdds, setShowOdds] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Design Mockup - Enhanced Mobile Layout
          </h1>
          
          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-base font-semibold text-gray-900 dark:text-white">15/01</span>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Odds/TV Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Odds</span>
              <button
                onClick={() => setShowOdds(!showOdds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
                  showOdds ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOdds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">TV</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: null },
              { key: 'live', label: 'Live', count: 1 },
              { key: 'finished', label: 'Finished', count: 1 },
              { key: 'upcoming', label: 'Upcoming', count: 1 }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
                  selectedFilter === filter.key
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {filter.label}
                {filter.count && (
                  <span className="ml-1 text-xs">({filter.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {mockCompetitions.map(competition => (
          <div key={competition.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Competition Header */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5">
                  <img 
                    src={competition.country.image_path} 
                    alt={competition.country.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {competition.country.name} - {competition.name}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442c.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            </div>

            {/* Matches */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {competition.matches.map(match => (
                <EnhancedMatchCard 
                  key={match.id} 
                  match={match} 
                  showOdds={showOdds}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Design Notes */}
      <div className="px-4 py-6 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Design Improvements Showcased:
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• <strong>Global Toggle:</strong> Switch between Odds and TV Channels view</li>
            <li>• <strong>Enhanced Live Styling:</strong> Orange accent for live matches with left border</li>
            <li>• <strong>Winning Team Highlighting:</strong> Bold text and green odds for winners</li>
            <li>• <strong>Compact TV Display:</strong> Up to 3 channel logos + "+X more" indicator</li>
            <li>• <strong>Improved Touch Targets:</strong> Larger, more accessible interactive elements</li>
            <li>• <strong>Better Visual Hierarchy:</strong> Clear separation between different information types</li>
            <li>• <strong>Filter System:</strong> Quick filtering by match status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
