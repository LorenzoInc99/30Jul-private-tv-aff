"use client";
import { useState, useEffect } from 'react';
import DateNavigator from './DateNavigator';
import LeagueSchedule from './LeagueSchedule';
import TimezoneSelector from './TimezoneSelector';
import { supabaseBrowser } from '@/lib/supabase';

function getInitialTimezone() {
  if (typeof window === 'undefined') return 'auto';
  return localStorage.getItem('userTimezone') || 'auto';
}

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

export default function MatchSchedule({ timezone, setTimezone }: { timezone: string; setTimezone: (tz: string) => void }) {
  const [hydrated, setHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate selectedDate from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedDate');
      if (saved) {
        const d = new Date(saved);
        if (!isNaN(d.getTime())) {
          setSelectedDate(d);
          setHydrated(true);
          return;
        }
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !selectedDate) return;
    setLoading(true);
    setError(null);
    const fetchMatches = async () => {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      const { data, error } = await supabaseBrowser
        .from('Events')
        .select('*, Competitions!events_competition_fk(*)')
        .gte('start_time', start.toISOString())
        .lt('start_time', end.toISOString())
        .order('start_time', { ascending: true });

      console.log('Events data:', data, 'Error:', error);
      if (error) {
        setError(error.message);
        setCompetitions([]);
      } else {
        // Group matches by competition
        const matchesByCompetition: Record<string, { competition: any; matches: any[] }> = {};
        for (const match of data || []) {
          // REMOVE or comment out this line for debugging:
          // if (!match.Competitions || !match.home_team || !match.away_team) continue;
          const compId = match.Competitions?.id || 'unknown';
          if (!matchesByCompetition[compId]) {
            matchesByCompetition[compId] = { competition: match.Competitions || { name: 'Unknown' }, matches: [] };
          }
          matchesByCompetition[compId].matches.push(match);
        }
        const sorted = Object.values(matchesByCompetition).sort((a, b) => a.competition.name.localeCompare(b.competition.name));
        setCompetitions(sorted);
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

  // Flatten matches for structured data
  const allMatches = competitions.flatMap(c => c.matches);

  if (!hydrated || !selectedDate) {
    // Show only background color (no content) while hydrating
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  return (
    <div>
      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
      {!loading && !error && allMatches.length > 0 && <HomeStructuredData matches={allMatches} />}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading matches...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Error: {error}</div>
      ) : competitions.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No matches found for this day.</div>
      ) : (
        <LeagueSchedule competitions={competitions} timezone={timezone} />
      )}
    </div>
  );
} 