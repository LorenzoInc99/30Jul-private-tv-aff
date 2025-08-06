'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function DebugSpecificMatch() {
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the specific match with all related data
        const { data: match, error: matchError } = await supabaseBrowser
          .from('fixtures')
          .select(`
            *,
            home_team: home_team_id(name, team_logo_url),
            away_team: away_team_id(name, team_logo_url),
            Competitions: league_id(name),
            Event_Broadcasters: fixturetvstations(
              Broadcasters: tvstation_id(
                name,
                logo_url,
                affiliate_url
              )
            ),
            Odds: odds(
              market_id,
              label,
              value,
              bookmaker_id
            )
          `)
          .eq('id', 19425586)
          .single();

        if (matchError) {
          setError(matchError.message);
        } else {
          setMatchData(match);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!matchData) return <div className="p-4 text-red-500">Match not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Match 19425586</h1>
      
      <div className="space-y-6">
        {/* Basic Match Info */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Basic Info</h2>
          <p><strong>Name:</strong> {matchData.name}</p>
          <p><strong>Starting At:</strong> {new Date(matchData.starting_at).toLocaleString()}</p>
          <p><strong>Status:</strong> {matchData.status}</p>
          <p><strong>State ID:</strong> {matchData.state_id}</p>
          <p><strong>Home Team:</strong> {matchData.home_team?.name}</p>
          <p><strong>Away Team:</strong> {matchData.away_team?.name}</p>
          <p><strong>Competition:</strong> {matchData.Competitions?.name}</p>
        </div>

        {/* TV Channels */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">TV Channels</h2>
          <p><strong>Event_Broadcasters Array Length:</strong> {matchData.Event_Broadcasters?.length || 0}</p>
          {matchData.Event_Broadcasters && matchData.Event_Broadcasters.length > 0 ? (
            <div className="space-y-2">
              {matchData.Event_Broadcasters.map((eb: any, index: number) => (
                <div key={index} className="ml-4 p-2 bg-gray-50 rounded">
                  <p><strong>Broadcaster:</strong> {eb.Broadcasters?.name || 'No name'}</p>
                  <p><strong>Logo URL:</strong> {eb.Broadcasters?.logo_url || 'No logo'}</p>
                  <p><strong>Affiliate URL:</strong> {eb.Broadcasters?.affiliate_url || 'No affiliate'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No TV channels found</p>
          )}
        </div>

        {/* Odds */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Odds</h2>
          <p><strong>Odds Array Length:</strong> {matchData.Odds?.length || 0}</p>
          {matchData.Odds && matchData.Odds.length > 0 ? (
            <div className="space-y-2">
              {matchData.Odds.slice(0, 5).map((odd: any, index: number) => (
                <div key={index} className="ml-4 p-2 bg-gray-50 rounded">
                  <p><strong>Label:</strong> {odd.label}</p>
                  <p><strong>Value:</strong> {odd.value}</p>
                  <p><strong>Market ID:</strong> {odd.market_id}</p>
                  <p><strong>Bookmaker ID:</strong> {odd.bookmaker_id}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No odds found</p>
          )}
        </div>

        {/* Raw Data */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Raw Data</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(matchData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 