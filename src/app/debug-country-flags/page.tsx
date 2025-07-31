'use client';

import { useState, useEffect } from 'react';
import { getMatchesForDate } from '@/lib/database-adapter';
import CountryFlag from '@/components/CountryFlag';

export default function DebugCountryFlags() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const data = await getMatchesForDate(today);
        console.log('Raw matches data:', data);
        
        // Group by competition to see country data
        const competitions = new Map();
        data.forEach((match: any) => {
          if (match.Competitions) {
            const compId = match.Competitions.id;
            if (!competitions.has(compId)) {
              competitions.set(compId, {
                ...match.Competitions,
                matches: []
              });
            }
            competitions.get(compId).matches.push(match);
          }
        });
        
        console.log('Competitions with country data:', Array.from(competitions.values()));
        setMatches(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Country Flags</h1>
      
      <div className="space-y-4">
        {Array.from(new Set(matches.map(m => m.Competitions?.id))).map(compId => {
          const match = matches.find(m => m.Competitions?.id === compId);
          if (!match?.Competitions) return null;
          
          return (
            <div key={compId} className="border p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">Competition: {match.Competitions.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <span>Country Flag:</span>
                <CountryFlag 
                  imagePath={match.Competitions.country?.image_path} 
                  countryName={match.Competitions.country?.name || 'Unknown'} 
                  size="md" 
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Country ID: {match.Competitions.country?.id || 'null'}</p>
                <p>Country Name: {match.Competitions.country?.name || 'null'}</p>
                <p>Country Flag URL: {match.Competitions.country?.image_path || 'null'}</p>
                <p>League Country ID: {match.Competitions.country_id || 'null'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 