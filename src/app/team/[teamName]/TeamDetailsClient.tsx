"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SITE_TITLE } from '../../../lib/constants';
import Breadcrumbs from '@/components/Breadcrumbs';
import MatchCard from '@/components/MatchCard';
import MatchDetails from '@/components/MatchDetails';
import TeamLogo from '@/components/TeamLogo';
import TeamFormRectangles from '@/components/TeamFormRectangles';
import { getMatchStatus } from '@/lib/database-config';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function transformMatchForCard(match: any) {
  if (!match) return null;
  
  return {
    id: match.id,
    name: match.name,
    start_time: match.starting_at,
    home_score: match.home_score,
    away_score: match.away_score,
    status: getMatchStatus(match.state_id),
    Competitions: {
      id: match.league?.id,
      name: match.league?.name,
      country: null
    },
    home_team: {
      id: match.home_team?.id,
      name: match.home_team?.name,
      team_logo_url: match.home_team?.team_logo_url
    },
    away_team: {
      id: match.away_team?.id,
      name: match.away_team?.name,
      team_logo_url: match.away_team?.team_logo_url
    },
    Event_Broadcasters: [],
    Odds: match.odds || []
  };
}

function NextMatchDetails({ match }: { match: any }) {
  if (!match) {
    return <div>No match data available</div>;
  }

  const getMatchStatus = () => {
    if (match.status === 'Live') return { text: 'LIVE', color: 'bg-red-500' };
    if (match.status === 'Finished') return { text: 'FULL TIME', color: 'bg-gray-500' };
    if (match.status === 'Scheduled') return { text: 'UPCOMING', color: 'bg-blue-500' };
    return { text: match.status, color: 'bg-gray-400' };
  };
  
  const status = getMatchStatus();
  const hasBroadcasters = match.Event_Broadcasters && match.Event_Broadcasters.length > 0;

  // Format date and time for the paragraph
  const matchDate = new Date(match.start_time);
  const formattedDate = matchDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = matchDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get the center content (time or result)
  const getCenterContent = () => {
    if (match.status === 'Finished' || match.status === 'Live') {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {match.home_score} - {match.away_score}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {match.status === 'Live' ? 'LIVE' : 'FULL TIME'}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {new Date(match.start_time).toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(match.start_time).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {/* Match Header */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-1 w-full">
        <div className={`px-6 py-3 ${status.color} text-white text-sm font-semibold uppercase tracking-wide`}>
          {status.text}
        </div>
        <div className="p-6">
          {/* Competition */}
          <div className="text-center mb-6">
            <Link 
              href={`/competition/${match.Competitions?.id}-${match.Competitions?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {match.Competitions?.name}
            </Link>
          </div>
          
          {/* Mobile: Compact layout for teams/score/time */}
          <div className="md:hidden flex flex-col items-center gap-4 mb-8 w-full">
            {/* Teams and center content row */}
            <div className="flex flex-row items-center justify-between w-full gap-4">
              {/* Team 1 */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <img 
                  src={match.home_team?.team_logo_url || 'https://placehold.co/40x40/f3f4f6/f3f4f6'} 
                  alt={match.home_team?.name || 'Home team logo'} 
                  className="w-10 h-10 object-contain mb-1" 
                />
                <Link
                  href={`/team/${slugify(match.home_team?.name || '')}`}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center"
                >
                  {match.home_team?.name}
                </Link>
                <TeamFormRectangles
                  teamId={match.home_team?.id}
                  matchStartTime={match.start_time}
                />
              </div>
              
              {/* Center content (time or result) */}
              <div className="flex flex-col items-center justify-center w-16 mx-2">
                {getCenterContent()}
              </div>
              
              {/* Team 2 */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <img 
                  src={match.away_team?.team_logo_url || 'https://placehold.co/40x40/f3f4f6/f3f4f6'} 
                  alt={match.away_team?.name || 'Away team logo'} 
                  className="w-10 h-10 object-contain mb-1" 
                />
                <Link
                  href={`/team/${slugify(match.away_team?.name || '')}`}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center"
                >
                  {match.away_team?.name}
                </Link>
                <TeamFormRectangles
                  teamId={match.away_team?.id}
                  matchStartTime={match.start_time}
                />
              </div>
            </div>
          </div>
          
          {/* Desktop: Teams, logos, and center content row */}
          <div className="hidden md:flex items-center justify-between mb-8 w-full">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <img
                src={match.home_team?.team_logo_url || 'https://placehold.co/60x60/f3f4f6/f3f4f6'}
                alt={match.home_team?.name || 'Home team logo'}
                className="w-14 h-14 object-contain mb-1"
              />
              <Link
                href={`/team/${slugify(match.home_team?.name || '')}`}
                className="text-base font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center"
              >
                {match.home_team?.name}
              </Link>
              <TeamFormRectangles
                teamId={match.home_team?.id}
                matchStartTime={match.start_time}
              />
            </div>
            
            {/* Center content (time or result) */}
            <div className="flex flex-col items-center justify-center w-24 mx-6">
              {getCenterContent()}
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <img
                src={match.away_team?.team_logo_url || 'https://placehold.co/60x60/f3f4f6/f3f4f6'}
                alt={match.away_team?.name || 'Away team logo'}
                className="w-14 h-14 object-contain mb-1"
              />
              <Link
                href={`/team/${slugify(match.away_team?.name || '')}`}
                className="text-base font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center"
              >
                {match.away_team?.name}
              </Link>
              <TeamFormRectangles
                teamId={match.away_team?.id}
                matchStartTime={match.start_time}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* TV Streamers Section */}
      {hasBroadcasters && (
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-2 w-full">
          <div className="p-2">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 3H3C2.45 3 2 3.45 2 4V20C2 20.55 2.45 21 3 21H21C21.55 21 22 20.55 22 20V4C22 3.45 21.55 3 21 3ZM20 19H4V5H20V19ZM10 10H8V12H10V10ZM16 10H14V12H16V10Z"/>
              </svg>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Watch on TV</h2>
            </div>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Where to watch {match.home_team?.name} vs {match.away_team?.name}:</strong> Catch all the action of this exciting {match.Competitions?.name} match between {match.home_team?.name} and {match.away_team?.name} live on TV on {formattedDate} at {formattedTime}. Don't miss a moment of this thrilling football encounter as both teams battle it out for victory.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-y-1 gap-x-2">
              {match.Event_Broadcasters.map((eb: any, i: number) => {
                const b = eb.Broadcasters;
                if (!b?.name) return null;
                return (
                  <div key={i} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamDetailsClient({ team, nextMatch, previousMatches }: { 
  team: any; 
  nextMatch: any; 
  previousMatches: any[] 
}) {
  const searchParams = useSearchParams();
  const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  function getTargetTimezone() {
    if (timezone === 'auto') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }

  const transformedNextMatch = transformMatchForCard(nextMatch);
  const transformedPreviousMatches = previousMatches.map(transformMatchForCard).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: team.name, url: `/team/${slugify(team.name)}` }
          ]}
        />
      </div>
      
      <div className="container mx-auto max-w-7xl px-1 md:px-2">
        <main className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">


          {/* Next Match Section */}
          <div className="mb-8">
            {transformedNextMatch ? (
              <NextMatchDetails match={transformedNextMatch} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No upcoming matches scheduled for {team.name}.
              </div>
            )}
          </div>

          {/* Previous Matches Section */}
          <div className="mb-8">
            {transformedPreviousMatches.length > 0 ? (
              <div className="space-y-2">
                {transformedPreviousMatches.map((match) => {
                  if (!match) return null;
                  return (
                    <MatchCard
                      key={match.id}
                      match={match}
                      timezone={timezone}
                      isExpanded={false}
                      onExpandToggle={() => {}}
                      onClick={() => {
                        const homeSlug = slugify(match.home_team?.name || 'home');
                        const awaySlug = slugify(match.away_team?.name || 'away');
                        const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}?timezone=${encodeURIComponent(getTargetTimezone())}`;
                        window.open(matchUrl, '_blank');
                      }}
                      hideCompetitionName={false}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No previous matches found for {team.name}.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 