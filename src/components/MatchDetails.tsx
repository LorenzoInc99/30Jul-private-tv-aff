"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import TeamFormRectangles from './TeamFormRectangles';
import BroadcasterLogo from './BroadcasterLogo';
import { slugify } from '../lib/utils';

// Multiple template components for variety
function WhereToWatchParagraph1({ homeTeam, awayTeam, competition, date, time }: { 
  homeTeam: string; awayTeam: string; competition: string; date: string; time: string; 
}) {
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <strong>Where to watch {homeTeam} vs {awayTeam}:</strong> Catch all the action of this exciting {competition} match between {homeTeam} and {awayTeam} live on TV on {date} at {time}. Don't miss a moment of this thrilling football encounter as both teams battle it out for victory. Tune in to your preferred broadcaster to watch {homeTeam} vs {awayTeam} live and experience the drama, goals, and excitement of this highly anticipated match.
      </p>
    </div>
  );
}

function WhereToWatchParagraph2({ homeTeam, awayTeam, competition, date, time }: { 
  homeTeam: string; awayTeam: string; competition: string; date: string; time: string; 
}) {
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <strong>Live TV coverage for {homeTeam} vs {awayTeam}:</strong> Football fans won't want to miss this {competition} showdown between {homeTeam} and {awayTeam} on {date} at {time}. This highly anticipated clash promises to deliver top-tier football action with both teams looking to secure crucial points. Find out where to watch {homeTeam} vs {awayTeam} live on television and join millions of viewers for this must-see match.
      </p>
    </div>
  );
}

function WhereToWatchParagraph3({ homeTeam, awayTeam, competition, date, time }: { 
  homeTeam: string; awayTeam: string; competition: string; date: string; time: string; 
}) {
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <strong>TV broadcast details for {homeTeam} vs {awayTeam}:</strong> The {competition} continues with an exciting fixture featuring {homeTeam} taking on {awayTeam} on {date} at {time}. This match is set to be broadcast live across multiple TV channels, giving fans plenty of options to watch {homeTeam} vs {awayTeam} from the comfort of their homes. Don't miss this crucial encounter in the {competition} season.
      </p>
    </div>
  );
}

function WhereToWatchParagraph4({ homeTeam, awayTeam, competition, date, time }: { 
  homeTeam: string; awayTeam: string; competition: string; date: string; time: string; 
}) {
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <strong>How to watch {homeTeam} vs {awayTeam} live:</strong> Football enthusiasts can tune in to watch {homeTeam} vs {awayTeam} in this {competition} fixture scheduled for {date} at {time}. This match-up between {homeTeam} and {awayTeam} is expected to be a thrilling contest with both teams eager to claim victory. Check the TV listings below to find where to watch {homeTeam} vs {awayTeam} live on your preferred channel.
      </p>
    </div>
  );
}

function WhereToWatchParagraph5({ homeTeam, awayTeam, competition, date, time }: { 
  homeTeam: string; awayTeam: string; competition: string; date: string; time: string; 
}) {
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <strong>Live football: {homeTeam} vs {awayTeam} on TV:</strong> The {competition} presents an unmissable clash between {homeTeam} and {awayTeam} on {date} at {time}. This fixture promises to deliver high-quality football action as both {homeTeam} and {awayTeam} compete for supremacy. Discover where to watch {homeTeam} vs {awayTeam} live on television and be part of the excitement as these two teams go head-to-head in this crucial match.
      </p>
    </div>
  );
}

// Template selector that ensures consistent selection per match
function WhereToWatchParagraph({ 
  homeTeam, 
  awayTeam, 
  competition, 
  date, 
  time,
  matchId 
}: { 
  homeTeam: string; 
  awayTeam: string; 
  competition: string; 
  date: string; 
  time: string;
  matchId: string;
}) {
  const templates = [
    WhereToWatchParagraph1,
    WhereToWatchParagraph2,
    WhereToWatchParagraph3,
    WhereToWatchParagraph4,
    WhereToWatchParagraph5
  ];
  
  // Use match ID to ensure consistent template per match
  const templateIndex = parseInt(matchId.replace(/\D/g, '')) % templates.length;
  const SelectedTemplate = templates[templateIndex];
  
  return <SelectedTemplate homeTeam={homeTeam} awayTeam={awayTeam} competition={competition} date={date} time={time} />;
}

export default function MatchDetails({ match }: { match: any }) {
  const getMatchStatus = () => {
    if (match.status === 'Live') return { text: 'LIVE', color: 'bg-red-500' };
    if (match.status === 'Finished') return { text: 'FULL TIME', color: 'bg-gray-500' };
    if (match.status === 'Scheduled') return { text: 'UPCOMING', color: 'bg-blue-500' };
    return { text: match.status, color: 'bg-gray-400' };
  };
  const status = getMatchStatus();
  const hasOdds = match.Odds && match.Odds.length > 0;
  const hasBroadcasters = match.Event_Broadcasters && match.Event_Broadcasters.length > 0;
  const [showOdds, setShowOdds] = useState(true);

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
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-2 w-full">
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Home team logo clicked:', match.home_team?.name);
                    const teamUrl = `/team/${slugify(match.home_team?.name || '')}`;
                    console.log('Navigating to:', teamUrl);
                    window.open(teamUrl, '_blank');
                  }}
                  className="cursor-pointer transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:opacity-80"
                  style={{ cursor: 'pointer' }}
                >
                  <Image 
                    src={match.home_team?.logo_url || 'https://placehold.co/40x40/f3f4f6/f3f4f6'} 
                    alt={match.home_team?.name || 'Home team logo'} 
                    width={40} height={40} className="w-10 h-10 object-contain mb-1" 
                    loading="lazy"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Home team clicked:', match.home_team?.name);
                    const teamUrl = `/team/${slugify(match.home_team?.name || '')}`;
                    console.log('Navigating to:', teamUrl);
                    window.open(teamUrl, '_blank');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:rounded px-2 py-1"
                  style={{ cursor: 'pointer' }}
                >
                  {match.home_team?.name}
                </button>
                <TeamFormRectangles
                  teamId={match.home_team_id}
                  matchStartTime={match.start_time}
                />
              </div>
              
              {/* Center content (time or result) */}
              <div className="flex flex-col items-center justify-center w-16 mx-2">
                {getCenterContent()}
              </div>
              
              {/* Team 2 */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Away team logo clicked:', match.away_team?.name);
                    const teamUrl = `/team/${slugify(match.away_team?.name || '')}`;
                    console.log('Navigating to:', teamUrl);
                    window.open(teamUrl, '_blank');
                  }}
                  className="cursor-pointer transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:opacity-80"
                  style={{ cursor: 'pointer' }}
                >
                  <Image 
                    src={match.away_team?.logo_url || 'https://placehold.co/40x40/f3f4f6/f3f4f6'} 
                    alt={match.away_team?.name || 'Away team logo'} 
                    width={40} height={40} className="w-10 h-10 object-contain mb-1" 
                    loading="lazy"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Away team clicked:', match.away_team?.name);
                    const teamUrl = `/team/${slugify(match.away_team?.name || '')}`;
                    console.log('Navigating to:', teamUrl);
                    window.open(teamUrl, '_blank');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:rounded px-2 py-1"
                  style={{ cursor: 'pointer' }}
                >
                  {match.away_team?.name}
                </button>
                <TeamFormRectangles
                  teamId={match.away_team_id}
                  matchStartTime={match.start_time}
                />
              </div>
            </div>
          </div>
          
          {/* Desktop: Teams, logos, and center content row */}
          <div className="hidden md:flex items-center justify-between mb-8 w-full">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Home team logo clicked:', match.home_team?.name);
                  const teamUrl = `/team/${slugify(match.home_team?.name || '')}`;
                  console.log('Navigating to:', teamUrl);
                  window.open(teamUrl, '_blank');
                }}
                className="cursor-pointer transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:opacity-80"
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={match.home_team?.logo_url || 'https://placehold.co/60x60/f3f4f6/f3f4f6'}
                  alt={match.home_team?.name || 'Home team logo'}
                  width={60} height={60} className="w-14 h-14 object-contain mb-1"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Home team clicked:', match.home_team?.name);
                  const teamUrl = `/team/${slugify(match.home_team?.name || '')}`;
                  console.log('Navigating to:', teamUrl);
                  window.open(teamUrl, '_blank');
                }}
                className="text-base font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:rounded px-2 py-1"
                style={{ cursor: 'pointer' }}
              >
                {match.home_team?.name}
              </button>
              <TeamFormRectangles
                teamId={match.home_team_id}
                matchStartTime={match.start_time}
              />
            </div>
            
            {/* Center content (time or result) */}
            <div className="flex flex-col items-center justify-center w-24 mx-6">
              {getCenterContent()}
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Away team logo clicked:', match.away_team?.name);
                  const teamUrl = `/team/${slugify(match.away_team?.name || '')}`;
                  console.log('Navigating to:', teamUrl);
                  window.open(teamUrl, '_blank');
                }}
                className="cursor-pointer transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm hover:opacity-80"
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={match.away_team?.logo_url || 'https://placehold.co/60x60/f3f4f6/f3f4f6'}
                  alt={match.away_team?.name || 'Away team logo'}
                  width={60} height={60} className="w-14 h-14 object-contain mb-1"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Away team clicked:', match.away_team?.name);
                  const teamUrl = `/team/${slugify(match.away_team?.name || '')}`;
                  console.log('Navigating to:', teamUrl);
                  window.open(teamUrl, '_blank');
                }}
                className="text-base font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate w-full text-center transition-all duration-100 ease-in-out hover:scale-105 hover:drop-shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:rounded px-2 py-1"
                style={{ cursor: 'pointer' }}
              >
                {match.away_team?.name}
              </button>
              <TeamFormRectangles
                teamId={match.away_team_id}
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
            {/* Standardized "where to watch" paragraph */}
            <WhereToWatchParagraph
              homeTeam={match.home_team?.name || 'Home Team'}
              awayTeam={match.away_team?.name || 'Away Team'}
              competition={match.Competitions?.name || 'Football Match'}
              date={formattedDate}
              time={formattedTime}
              matchId={match.id}
            />
            <div className="mt-5 grid grid-cols-2 gap-y-1 gap-x-2">
              {match.Event_Broadcasters.map((eb: any, i: number) => {
                const b = eb.Broadcasters;
                if (!b?.name) return null;
                return b.affiliate_url ? (
                  <a
                    key={i}
                    href={b.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors text-sm"
                    aria-label={`Watch on ${b.name}`}
                  >
                    <div className="mr-2">
                      <BroadcasterLogo
                        logoUrl={b.logo_url}
                        broadcasterName={b.name}
                        size="sm"
                        className="!w-7 !h-7"
                        showLabel={false}
                      />
                    </div>
                    <span className="text-xs">{b.name}</span>
                  </a>
                ) : (
                  <span key={i} className="flex items-center text-gray-400 text-sm">
                    <div className="mr-2">
                      <BroadcasterLogo
                        logoUrl={b.logo_url}
                        broadcasterName={b.name}
                        size="sm"
                        className="!w-7 !h-7"
                        showLabel={false}
                      />
                    </div>
                    <span className="text-xs">{b.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Betting Odds Section */}
      {hasOdds && (
        <BettingOddsSection odds={match.Odds} />
      )}
      {/* Stats Tabs Section */}
      <StatsTabs />
    </div>
  );
} 

// Betting Odds Section Component
function BettingOddsSection({ odds }: { odds: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayOdds = showAll ? odds : odds.slice(0, 5);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-none shadow-none overflow-hidden mb-2 w-full">
      <div className="p-2">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4h16v16H4z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Betting Odds</h2>
        </div>
        <div className="flex flex-col gap-1">
          {displayOdds.map((odd, i) => {
            const op = odd.Operators;
            if (!op?.name) return null;
            const logo = op.logo_url || '';
            const logoEl = logo ? (
              <img
                src={logo}
                alt={op.name}
                className="w-7 h-7 object-contain bg-white rounded mr-2 border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-7 h-7 bg-white rounded mr-2 border border-gray-200 dark:border-gray-700" />
            );
            // Helper for odds pill
            const OddsPill = ({ value, label }: { value: string, label: string }) =>
              value ? (
                <span
                  className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors min-w-[64px] min-h-[36px] font-bold text-xs text-indigo-600 dark:text-indigo-400"
                >
                  {value}
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[64px] min-h-[36px] font-bold text-xs text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed">
                  -
                </span>
              );
            const content = (
              <div className="flex items-center text-sm justify-between w-full min-h-[48px] py-2 px-1">
                <div className="flex items-center min-w-0">
                  {logoEl}
                  <span className="text-xs font-semibold mr-2 min-w-[80px] truncate">{op.name}</span>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <OddsPill value={odd.home_win ? parseFloat(odd.home_win).toFixed(2) : ''} label="1" />
                  <OddsPill value={odd.draw ? parseFloat(odd.draw).toFixed(2) : ''} label="X" />
                  <OddsPill value={odd.away_win ? parseFloat(odd.away_win).toFixed(2) : ''} label="2" />
                </div>
              </div>
            );
            return op.affiliate_url ? (
              <a
                key={i}
                href={op.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                aria-label={`Bet with ${op.name}`}
              >
                {content}
              </a>
            ) : (
              <div key={i} className="flex items-center text-sm justify-between w-full min-h-[48px] py-2 px-1 opacity-60 cursor-not-allowed">
                <div className="flex items-center min-w-0">
                  {logoEl}
                  <span className="text-xs font-semibold mr-2 min-w-[80px] truncate">{op.name}</span>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <OddsPill value={odd.home_win ? parseFloat(odd.home_win).toFixed(2) : ''} label="1" />
                  <OddsPill value={odd.draw ? parseFloat(odd.draw).toFixed(2) : ''} label="X" />
                  <OddsPill value={odd.away_win ? parseFloat(odd.away_win).toFixed(2) : ''} label="2" />
                </div>
              </div>
            );
          })}
        </div>
        {odds.length > 5 && (
          <button
            className="mt-2 text-xs text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    </div>
  );
} 

// Tabbed stats section with placeholders
function StatsTabs() {
  const [activeTab, setActiveTab] = useState('info');
  const TABS = [
    { key: 'info', label: 'Info' },
    { key: 'lineups', label: 'Line-ups' },
    { key: 'h2h', label: 'H2H' },
  ];
  return (
    <div className="w-full mt-4">
      <div className="flex border-b border-gray-700 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 whitespace-nowrap transition-colors
              ${activeTab === tab.key
                ? 'text-orange-400 border-b-2 border-orange-400 text-lg font-bold'
                : 'text-gray-400 hover:text-white border-b-2 border-transparent text-lg font-semibold'}
            `}
            aria-selected={activeTab === tab.key}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 'info' && <InfoComponent />}
        {activeTab === 'lineups' && <LineupsComponent />}
        {activeTab === 'h2h' && <H2HComponent />}
      </div>
    </div>
  );
}

function InfoComponent() {
  return <div className="text-gray-400">Info coming soon...</div>;
}
function LineupsComponent() {
  return <div className="text-gray-400">Line-ups coming soon...</div>;
}
function H2HComponent() {
  return <div className="text-gray-400">Head-to-Head stats coming soon...</div>;
} 