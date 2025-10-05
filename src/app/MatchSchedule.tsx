"use client";
import { useState, useEffect } from 'react';
import DateNavigator from './DateNavigator';
import LeagueSchedule from './LeagueSchedule';
import TimezoneSelector from './TimezoneSelector';
import CountryDropdown from '../components/CountryDropdown';
import { getMatchesForDate } from '@/lib/database-adapter';
import { DateNavigatorSkeleton } from '../components/SkeletonLoader';
import { LoadingEmptyState } from '../components/EmptyStates';

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
  onStarToggle,
  selectedDate: propSelectedDate,
  selectedFilter: propSelectedFilter,
  showOdds: propShowOdds,
  showTv: propShowTv
}: { 
  timezone: string; 
  setTimezone: (tz: string) => void;
  activeTab?: 'scores' | 'news' | 'bet-calculator';
  starredMatches?: Set<string>;
  onStarToggle?: (matchId: string) => void;
  selectedDate?: Date | null;
  selectedFilter?: 'all' | 'live' | 'finished' | 'upcoming';
  showOdds?: boolean;
  showTv?: boolean;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(propSelectedDate || null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOdds, setShowOdds] = useState(propShowOdds !== undefined ? propShowOdds : true);
  const [showTv, setShowTv] = useState(propShowTv !== undefined ? propShowTv : true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'finished' | 'upcoming'>(propSelectedFilter || 'all');
  const [selectedCountry, setSelectedCountry] = useState<{ id: number; name: string; image_path?: string } | null>(null);

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
      
      // Set filter preference - default to 'all' for today's date
      const savedFilter = localStorage.getItem('selectedFilter') as 'all' | 'live' | 'finished' | 'upcoming';
      setSelectedFilter(savedFilter || 'all');
      
      setHydrated(true);
    }
  }, []);

  // Sync with props when they change
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  useEffect(() => {
    if (propSelectedFilter) {
      setSelectedFilter(propSelectedFilter);
    }
  }, [propSelectedFilter]);

  useEffect(() => {
    if (propShowOdds !== undefined) {
      setShowOdds(propShowOdds);
    }
  }, [propShowOdds]);

  useEffect(() => {
    if (propShowTv !== undefined) {
      setShowTv(propShowTv);
    }
  }, [propShowTv]);

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
        // Clear any previous errors if we successfully got data (even if empty)
        setError(null);
      } catch (error: any) {
        console.error('Error fetching matches:', error);
        setError(error.message || 'Failed to load matches');
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

  // Apply filter to competitions
  const getFilteredCompetitions = () => {
    let filteredComps = competitions.map(comp => ({
      ...comp,
      matches: filterMatches(comp.matches)
    }));

    const result = filteredComps.filter(comp => comp.matches.length > 0);
    return result;
  };

  const filteredCompetitions = getFilteredCompetitions();

  // Flatten matches for structured data
  const allMatches = filteredCompetitions.flatMap(c => c.matches);

  if (!hydrated || !selectedDate) {
    // Show loading skeleton while hydrating
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Desktop Navigation */}
      <div className="hidden md:block pt-1.5 pb-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg mb-3">
         {/* First Row: DateNavigator and Filter Pills */}
         <div className="flex items-center justify-between px-4 mb-1">
           <div className="flex items-center gap-4">
             <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
             {/* Filter Pills or Today Button */}
             <div className="flex">
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = selectedDate && selectedDate.toDateString() === today.toDateString();
            
            if (!isToday) {
              // Show Today button when not on today's date
              return (
                <button
                  onClick={() => {
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);
                    setSelectedDate(todayDate);
                    localStorage.setItem('selectedDate', todayDate.toISOString());
                  }}
                  className="px-4 py-1 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
                >
                  Today
                </button>
              );
            }

            // When date is today, show Live button with glass background
            if (isToday) {
              const liveMatchesCount = competitions.flatMap(c => c.matches).filter(m => 
                m.status === '1st Half' || m.status === '2nd Half' || m.status === 'Half Time' || 
                m.status === 'Extra Time' || m.status === 'Penalties'
              ).length;
              
              return (
                <button
                  onClick={() => setSelectedFilter(selectedFilter === 'live' ? 'all' : 'live')}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer ${
                    selectedFilter === 'live'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 dark:text-gray-300 hover:bg-white/30'
                  }`}
                >
                  Live
                </button>
              );
            }

            // Show all filters when date is not today
            const filters = [
              { key: 'all', label: 'All', count: competitions.flatMap(c => c.matches).length },
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
            ];
            
            return (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <div className="flex items-center space-x-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key as 'all' | 'live' | 'finished' | 'upcoming')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none cursor-pointer ${
                        selectedFilter === filter.key
                          ? 'text-white bg-indigo-600 shadow-lg transform scale-105'
                          : 'text-gray-600 dark:text-gray-400 hover:text-white hover:bg-gray-700 hover:scale-105'
                      }`}
                    >
                      {filter.label}
                      <span className="ml-1 text-xs">({filter.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
             </div>
           </div>
           
           {/* Display Toggles - Right aligned */}
           <div className="flex items-center gap-4">
             {/* Odds Toggle */}
             <div className="flex items-center gap-2 py-1">
               <span className={`text-sm transition-colors duration-500 ${showOdds ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>Odds</span>
               <button
                 onClick={() => setShowOdds(!showOdds)}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-500 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none cursor-pointer ${
                   showOdds ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                 }`}
               >
                 <span
                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ${
                     showOdds ? 'translate-x-6' : 'translate-x-1'
                   }`}
                 />
               </button>
             </div>
             
             {/* TV Toggle */}
             <div className="flex items-center gap-2 py-1">
               <span className={`text-sm transition-colors duration-500 ${showTv ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>TV</span>
               <button
                 onClick={() => setShowTv(!showTv)}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-500 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none cursor-pointer ${
                   showTv ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                 }`}
               >
                 <span
                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ${
                     showTv ? 'translate-x-6' : 'translate-x-1'
                   }`}
                 />
               </button>
             </div>
             
             {/* Country Dropdown */}
             <CountryDropdown 
               selectedCountry={selectedCountry} 
               onCountryChange={setSelectedCountry}
             />
           </div>
         </div>
       </div>


      {!loading && !error && allMatches.length > 0 && <HomeStructuredData matches={allMatches} />}
      {loading ? (
        <LoadingEmptyState message="Loading matches for the selected date..." />
      ) : error ? (
        <div className="text-center text-gray-500 py-10">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Connection issues</h3>
            <p className="text-gray-400 mb-6">We're having trouble loading the matches. Please check your connection and try again.</p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">No matches for this date</h3>
            <p className="text-gray-400 mb-6">No football matches are scheduled for this date. Try selecting a different date or check back later.</p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-gray-500">Coming soon...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <LeagueSchedule 
            competitions={filteredCompetitions} 
            timezone={timezone} 
            showOdds={showOdds} 
            showTv={showTv}
            selectedCountry={selectedCountry}
            starredMatches={starredMatches}
            onStarToggle={handleStarToggle}
          />
        </div>
      )}
    </div>
  );
} 