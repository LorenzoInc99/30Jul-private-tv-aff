"use client";
import { useState, useEffect } from 'react';
import DateNavigator from './DateNavigator';
import LeagueSchedule from './LeagueSchedule';
import TimezoneSelector from './TimezoneSelector';
import { getMatchesForDate } from '@/lib/database-adapter';

// Toggle preference management - removed unused functions

function HomeStructuredData({ matches }: { matches: any[] }) {
  if (!matches.length) return null;
  const itemListElements = matches.map((match, idx) => {
    if (!match.home_team || !match.away_team || !match.Competitions) return null;
    return {
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'SportsEvent',
        name: `${match.home_team.name} vs ${match.away_team.name}`,
        url: `/match/${match.id}`,
        startDate: new Date(match.start_time).toISOString(),
        sport: 'Football',
        performer: [
          { '@type': 'SportsTeam', name: match.home_team.name },
          { '@type': 'SportsTeam', name: match.away_team.name }
        ],
        superEvent: {
          '@type': 'SportsLeague',
          name: match.Competitions.name
        }
      }
    };
  }).filter(Boolean);
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'CollectionPage',
    name: 'Live Football on TV Today - Fixtures & Betting Odds | Sports TV Guide',
    description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds. Never miss a game!',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: itemListElements,
      numberOfItems: itemListElements.length,
      url: typeof window !== 'undefined' ? window.location.href : ''
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function MatchSchedule({ 
  timezone, 
  setTimezone, 
  activeTab = 'scores',
  starredMatches = new Set<string>(),
  onStarToggle
}: { 
  timezone: string; 
  setTimezone: (tz: string) => void;
  activeTab?: 'scores' | 'news' | 'favourites' | 'bet-calculator';
  starredMatches?: Set<string>;
  onStarToggle?: (matchId: string) => void;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOdds, setShowOdds] = useState(true);
  const [showTv, setShowTv] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'finished' | 'upcoming'>('all');

  // Hydrate selectedDate and toggle preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedDate');
      if (saved) {
        const d = new Date(saved);
        if (!isNaN(d.getTime())) {
          setSelectedDate(d);
              } else {
        // Use a date that has fixtures in the database (November 9, 2025)
        const defaultDate = new Date('2025-11-09');
        defaultDate.setHours(0, 0, 0, 0);
        setSelectedDate(defaultDate);
      }
      } else {
        // Use a date that has fixtures in the database (November 9, 2025)
        const defaultDate = new Date('2025-11-09');
        defaultDate.setHours(0, 0, 0, 0);
        setSelectedDate(defaultDate);
      }
      
      // Set toggle preferences
      const savedShowOdds = localStorage.getItem('showOdds');
      const savedShowTv = localStorage.getItem('showTv');
      setShowOdds(savedShowOdds !== null ? savedShowOdds === 'true' : true);
      setShowTv(savedShowTv !== null ? savedShowTv === 'true' : true);
      
      // Set filter preference
      const savedFilter = localStorage.getItem('selectedFilter') as 'all' | 'live' | 'finished' | 'upcoming';
      setSelectedFilter(savedFilter || 'all');
      
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !selectedDate) return;
    setLoading(true);
    setError(null);
    const fetchMatches = async () => {
      try {
        const data = await getMatchesForDate(selectedDate);
        // Group matches by competition
        const matchesByCompetition: Record<string, { competition: any; matches: any[] }> = {};
        for (const match of data) {
          if (!match.Competitions || !match.home_team || !match.away_team) continue;
          const compId = match.Competitions.id;
          if (!matchesByCompetition[compId]) {
            matchesByCompetition[compId] = { competition: match.Competitions, matches: [] };
          }
          matchesByCompetition[compId].matches.push(match);
        }
        const sorted = Object.values(matchesByCompetition).sort((a, b) => a.competition.name.localeCompare(b.competition.name));
        
        setCompetitions(sorted);
      } catch (error: any) {
        setError(error.message);
        setCompetitions([]);
      }
      setLoading(false);
    };
    fetchMatches();
    // Save selectedDate to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDate', selectedDate.toISOString());
    }
  }, [selectedDate, hydrated]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userTimezone', timezone);
    }
  }, [timezone]);

  // Save toggle preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showOdds', showOdds.toString());
      localStorage.setItem('showTv', showTv.toString());
    }
  }, [showOdds, showTv]);

  // Save filter preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedFilter', selectedFilter);
    }
  }, [selectedFilter]);

  // Handle star toggle
  const handleStarToggle = (matchId: string) => {
    if (onStarToggle) {
      onStarToggle(matchId);
    }
  };

  // Filter matches based on selected filter
  const filterMatches = (matches: any[]) => {
    switch (selectedFilter) {
      case 'live':
        return matches.filter(m => 
          m.status === '1st Half' || m.status === '2nd Half' || m.status === 'Half Time' || 
          m.status === 'Extra Time' || m.status === 'Penalties'
        );
      case 'finished':
        return matches.filter(m => 
          m.status === 'Finished' || m.status === 'Full Time' || m.status === 'After Extra Time' || m.status === 'After Penalties'
        );
      case 'upcoming':
        return matches.filter(m => 
          m.status === 'Not Started' || m.status === 'Scheduled'
        );
      default:
        return matches;
    }
  };

  // Apply filter to competitions and handle favourites
  const getFilteredCompetitions = () => {
    let filteredComps = competitions.map(comp => ({
      ...comp,
      matches: filterMatches(comp.matches)
    }));

    // If on favourites tab, only show starred matches
    if (activeTab === 'favourites') {
      filteredComps = filteredComps.map(comp => {
        const starredMatchesInComp = comp.matches.filter((match: any) => starredMatches.has(match.id));
        return {
          ...comp,
          matches: starredMatchesInComp
        };
      });
    }

    const result = filteredComps.filter(comp => comp.matches.length > 0);
    return result;
  };

  const filteredCompetitions = getFilteredCompetitions();

  // Flatten matches for structured data
  const allMatches = filteredCompetitions.flatMap(c => c.matches);

  if (!hydrated || !selectedDate) {
    // Show only background color (no content) while hydrating
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  return (
    <div>
      {/* Mobile Navigation Bar */}
      <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-3">
          <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Odds</span>
            <button
              onClick={() => setShowOdds(!showOdds)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
            { key: 'live', label: 'Live', count: competitions.flatMap(c => c.matches).filter(m => 
              m.status === '1st Half' || m.status === '2nd Half' || m.status === 'Half Time' || 
              m.status === 'Extra Time' || m.status === 'Penalties'
            ).length },
            { key: 'finished', label: 'Finished', count: competitions.flatMap(c => c.matches).filter(m => 
              m.status === 'Finished' || m.status === 'Full Time' || m.status === 'After Extra Time' || m.status === 'After Penalties'
            ).length },
            { key: 'upcoming', label: 'Upcoming', count: competitions.flatMap(c => c.matches).filter(m => 
              m.status === 'Not Started' || m.status === 'Scheduled'
            ).length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as 'all' | 'live' | 'finished' | 'upcoming')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {filter.label}
              {filter.count !== null && filter.count > 0 && (
                <span className="ml-1 text-xs">({filter.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg mx-2 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
            <div className="flex items-center gap-3">
              {/* Odds Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Odds</span>
                <button
                  onClick={() => setShowOdds(!showOdds)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showOdds ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showOdds ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* TV Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">TV</span>
                <button
                  onClick={() => setShowTv(!showTv)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showTv ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showTv ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex-shrink-0">
                <TimezoneSelector value={timezone} onChange={setTimezone} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Pills - Now inside the navigation bar */}
        <div className="flex gap-2 justify-center">
          {[
            { key: 'all', label: 'All', count: null },
            { key: 'live', label: 'Live', count: competitions.flatMap(c => c.matches).filter(m => 
              m.status === '1st Half' || m.status === '2nd Half' || m.status === 'Half Time' || 
              m.status === 'Extra Time' || m.status === 'Penalties'
            ).length },
            { key: 'finished', label: 'Finished', count: competitions.flatMap(c => c.matches).filter(m => 
              m.status === 'Finished' || m.status === 'Full Time' || m.status === 'After Extra Time' || m.status === 'After Penalties'
            ).length },
            { key: 'upcoming', label: 'Upcoming', count: competitions.flatMap(c => c.matches).filter(m => 
              m.status === 'Not Started' || m.status === 'Scheduled'
            ).length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as 'all' | 'live' | 'finished' | 'upcoming')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {filter.label}
              {filter.count !== null && filter.count > 0 && (
                <span className="ml-1 text-xs">({filter.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>


      {!loading && !error && allMatches.length > 0 && <HomeStructuredData matches={allMatches} />}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading matches...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Error: {error}</div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {activeTab === 'favourites' ? 'No starred matches found for this day.' : 
           selectedFilter === 'all' ? 'No matches found for this day.' : `No ${selectedFilter} matches found for this day.`}
        </div>
      ) : (
        <div className="w-full">
          <LeagueSchedule 
            competitions={filteredCompetitions} 
            timezone={timezone} 
            showOdds={showOdds} 
            showTv={showTv}
            starredMatches={starredMatches}
            onStarToggle={handleStarToggle}
          />
        </div>
      )}
    </div>
  );
} 