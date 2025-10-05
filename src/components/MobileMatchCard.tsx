'use client';

import { useState } from 'react';
import Link from 'next/link';
import { slugify } from '../lib/utils';
import { getMatchStatus } from '../lib/database-config';

interface MobileMatchCardProps {
  match: any;
  timezone: string;
  onTap?: () => void;
  onLongPress?: () => void;
  showOdds?: boolean;
  showTv?: boolean;
  isStarred?: boolean;
  onStarToggle?: (matchId: string) => void;
}

export default function MobileMatchCard({ 
  match, 
  timezone, 
  onTap, 
  onLongPress,
  showOdds = true,
  showTv = true,
  isStarred = false,
  onStarToggle
}: MobileMatchCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  if (!match) return null;

  const getMatchStatus = () => {
    if (match.status === 'Live') return { text: 'LIVE', color: 'bg-red-500' };
    if (match.status === 'Finished') return { text: 'FULL TIME', color: 'bg-gray-500' };
    if (match.status === 'Scheduled') return { text: 'UPCOMING', color: 'bg-blue-500' };
    return { text: match.status, color: 'bg-gray-400' };
  };

  const status = getMatchStatus();
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPressed(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      if (onTap) onTap();
      setIsPressed(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe || isRightSwipe) {
      // Handle swipe actions if needed
    } else {
      if (onTap) onTap();
    }
    
    setIsPressed(false);
  };

  const handleLongPress = () => {
    if (onLongPress) onLongPress();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 mx-2 transition-all duration-200 ${
        isPressed ? 'scale-95 shadow-md' : 'scale-100'
      } md:hidden`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchStartCapture={() => {
        const timer = setTimeout(handleLongPress, 500);
        return () => clearTimeout(timer);
      }}
    >
      {/* Status Bar */}
      <div className={`px-4 py-2 ${status.color} text-white text-xs font-semibold uppercase tracking-wide rounded-t-lg`}>
        {status.text}
      </div>

      <div className="p-4">
        {/* League */}
        <div className="text-center mb-4">
          <Link 
            href={`/competition/${match.Competitions?.id}-${match.Competitions?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {match.Competitions?.name}
          </Link>
        </div>

        {/* Teams and Score/Time */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img 
              src={match.home_team?.team_logo_url || 'https://placehold.co/32x32/f3f4f6/f3f4f6'} 
              alt={match.home_team?.name || 'Home team logo'} 
              className="w-8 h-8 object-contain flex-shrink-0" 
            />
            <Link
              href={match.home_team?.id ? `/team/${slugify(match.home_team?.name || '')}/${match.home_team?.id}` : `/team/${slugify(match.home_team?.name || '')}`}
              className="text-sm font-medium text-gray-900 dark:text-white hover:underline truncate"
            >
              {match.home_team?.name}
            </Link>
          </div>
          
          {/* Center Content */}
          <div className="flex flex-col items-center justify-center mx-4">
            {match.status === 'Finished' || match.status === 'Live' ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {match.home_score} - {match.away_score}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(match.start_time)}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTime(match.start_time)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(match.start_time)}
                </div>
              </div>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex items-center space-x-3 flex-1 min-w-0 justify-end">
            <Link
              href={match.away_team?.id ? `/team/${slugify(match.away_team?.name || '')}/${match.away_team?.id}` : `/team/${slugify(match.away_team?.name || '')}`}
              className="text-sm font-medium text-gray-900 dark:text-white hover:underline truncate text-right"
            >
              {match.away_team?.name}
            </Link>
            <img 
              src={match.away_team?.team_logo_url || 'https://placehold.co/32x32/f3f4f6/f3f4f6'} 
              alt={match.away_team?.name || 'Away team logo'} 
              className="w-8 h-8 object-contain flex-shrink-0" 
            />
          </div>
        </div>

        {/* Broadcasters */}
        {showTv && match.Event_Broadcasters && match.Event_Broadcasters.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 3H3C2.45 3 2 3.45 2 4V20C2 20.55 2.45 21 3 21H21C21.55 21 22 20.55 22 20V4C22 3.45 21.55 3 21 3ZM20 19H4V5H20V19ZM10 10H8V12H10V10ZM16 10H14V12H16V10Z"/>
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">Watch on:</span>
              <div className="flex space-x-1">
                {match.Event_Broadcasters.slice(0, 3).map((eb: any, i: number) => {
                  const b = eb.Broadcasters;
                  if (!b?.name) return null;
                  return (
                    <img
                      key={i}
                      src={b.logo_url || 'https://placehold.co/20x20/f3f4f6/f3f4f6'}
                      alt={b.name}
                      className="w-5 h-5 object-contain"
                      title={b.name}
                    />
                  );
                })}
                {match.Event_Broadcasters.length > 3 && (
                  <span className="text-xs text-gray-500">+{match.Event_Broadcasters.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Odds */}
        {showOdds && match.Odds && match.Odds.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Best Odds:</span>
              <div className="flex space-x-2">
                {match.Odds.slice(0, 3).map((odd: any, i: number) => (
                  <div key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {odd.name}: {odd.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Star Button */}
        {onStarToggle && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStarToggle(match.id);
              }}
              className={`p-1 rounded-full transition-colors ${
                isStarred 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <svg className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
