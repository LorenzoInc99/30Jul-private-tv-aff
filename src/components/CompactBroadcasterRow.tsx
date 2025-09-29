"use client";
import { useState } from 'react';
import Image from 'next/image';

interface CompactBroadcasterRowProps {
  broadcaster: any;
  clickCount: number;
  isMostPopular: boolean;
  onBroadcasterClick: (broadcasterId: number, matchId: number) => void;
  matchId: number;
}

export default function CompactBroadcasterRow({ 
  broadcaster, 
  clickCount, 
  isMostPopular, 
  onBroadcasterClick, 
  matchId 
}: CompactBroadcasterRowProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onBroadcasterClick(broadcaster.id, matchId);
    if (broadcaster.affiliate_url) {
      window.open(broadcaster.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine if it's free or paid
  const isFree = broadcaster.name.toLowerCase().includes('free') || 
                 broadcaster.name.toLowerCase().includes('public') ||
                 broadcaster.name.toLowerCase().includes('youtube');

  // Badge data
  const badges = [
    {
      id: 'subscription',
      label: isFree ? 'Free' : 'Paid',
      color: isFree ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
    },
    {
      id: 'popular',
      label: 'Popular',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      show: isMostPopular
    }
  ].filter(badge => badge.show !== false);

  return (
    <div 
      className={`
        group relative rounded-lg border transition-all duration-200 cursor-pointer
        ${isMostPopular 
          ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' 
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-gray-800'
        }
        hover:shadow-md dark:hover:shadow-lg
      `}
      onClick={handleClick}
    >
      <div className="flex items-center py-1 px-2 space-x-2">
        {/* Logo */}
        <div className="w-5 h-5 flex-shrink-0">
          {broadcaster.logo_url && !imageError ? (
            <Image
              src={broadcaster.logo_url}
              alt={`${broadcaster.name} logo`}
              width={20}
              height={20}
              className="w-5 h-5 object-contain rounded bg-white border border-gray-200 dark:border-gray-600"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-5 h-5 flex items-center justify-center rounded bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold">
              {broadcaster.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Name and Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <h3 className="font-normal text-gray-900 dark:text-white truncate text-[8px]">
              {broadcaster.name}
            </h3>
            
            {/* Badges */}
            <div className="flex space-x-0.5">
              {badges.map((badge) => (
                <span
                  key={badge.id}
                  className={`px-1 py-0.5 text-xs font-medium rounded-full ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            
            {/* Click count inline */}
            {clickCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({clickCount.toLocaleString()})
              </span>
            )}
          </div>
        </div>
        
        {/* Arrow indicator */}
        <div className="flex-shrink-0">
          <svg 
            className="w-2.5 h-2.5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
