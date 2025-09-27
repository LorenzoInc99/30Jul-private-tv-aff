"use client";
import Image from 'next/image';
import { useState } from 'react';

interface BroadcasterCardProps {
  broadcaster: {
    id: number;
    name: string;
    logo_url?: string;
    affiliate_url?: string;
  };
  clickCount: number;
  isMostPopular: boolean;
  onBroadcasterClick: (broadcasterId: number, matchId: number) => void;
  matchId: number;
}

export default function BroadcasterCard({ 
  broadcaster, 
  clickCount, 
  isMostPopular, 
  onBroadcasterClick, 
  matchId 
}: BroadcasterCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onBroadcasterClick(broadcaster.id, matchId);
    if (broadcaster.affiliate_url) {
      window.open(broadcaster.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine if it's free or paid (you can enhance this logic later)
  const isFree = broadcaster.name.toLowerCase().includes('free') || 
                 broadcaster.name.toLowerCase().includes('public') ||
                 broadcaster.name.toLowerCase().includes('youtube');

  // Determine device compatibility (you can enhance this logic later)
  const isMobileCompatible = true; // Most broadcasters are mobile compatible
  const isTVCompatible = !broadcaster.name.toLowerCase().includes('mobile');

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-300 cursor-pointer
      shadow-md hover:shadow-xl hover:-translate-y-1
      ${isMostPopular 
        ? 'border-yellow-400 shadow-yellow-200 dark:shadow-yellow-900/30' 
        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-gray-200 dark:shadow-gray-900/50'
      }
    `}>
      {/* Header with logo and popularity badge */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Logo */}
          <div className="w-12 h-12 flex-shrink-0">
            {broadcaster.logo_url && !imageError ? (
              <Image
                src={broadcaster.logo_url}
                alt={`${broadcaster.name} logo`}
                width={48}
                height={48}
                className="w-12 h-12 object-contain rounded bg-white border border-gray-200 dark:border-gray-600"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center rounded bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold">
                {broadcaster.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Broadcaster name and status */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2">
              {broadcaster.name}
            </h3>
            <div className="mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isFree 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
              }`}>
                {isFree ? 'Free to Watch' : 'Subscription Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Most Popular Badge */}
        {isMostPopular && (
          <div className="flex-shrink-0 ml-2">
            <div className="relative group">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L12 8.5 6.8 9.6L7.7 14z"/>
                </svg>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Most popular broadcaster
                <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Device compatibility and social proof */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {/* Device compatibility */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Mobile</span>
            </div>
            {isTVCompatible && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1.5-2H3V5h18v10h-3.5L16 17h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                </svg>
                <span>TV</span>
              </div>
            )}
          </div>

          {/* Social proof */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{clickCount} viewers</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-4 pb-4">
        {broadcaster.affiliate_url ? (
          <button
            onClick={handleClick}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isMostPopular 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 focus:ring-yellow-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
              }
            `}
          >
            {isMostPopular ? '🔥 WATCH NOW' : 'WATCH NOW'}
          </button>
        ) : (
          <div className="w-full py-3 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-center text-sm font-medium">
            No link available
          </div>
        )}
      </div>
    </div>
  );
}
