"use client";
import Image from 'next/image';
import { useState } from 'react';

interface BroadcasterRowProps {
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

export default function BroadcasterRow({ 
  broadcaster, 
  clickCount, 
  isMostPopular, 
  onBroadcasterClick, 
  matchId 
}: BroadcasterRowProps) {
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

  return (
    <div className={`
      group relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden
      ${isMostPopular 
        ? 'border-yellow-400 shadow-yellow-200 dark:shadow-yellow-900/30' 
        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-gray-200 dark:shadow-gray-900/50'
      }
    `}>
      {/* Hover Background Effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isMostPopular ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-indigo-50 dark:bg-indigo-900/10'}
      `}></div>
      
      {/* Row Content - 3 Row Layout */}
      <div className="relative p-3">
        {/* Row 1: Logo and Name */}
        <div className="flex items-center space-x-3 mb-2">
          {/* Logo */}
          <div className="w-10 h-10 flex-shrink-0">
            {broadcaster.logo_url && !imageError ? (
              <Image
                src={broadcaster.logo_url}
                alt={`${broadcaster.name} logo`}
                width={40}
                height={40}
                className="w-10 h-10 object-contain rounded bg-white border border-gray-200 dark:border-gray-600 shadow-sm"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-bold shadow-sm">
                {broadcaster.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Name and Popular Badge */}
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {broadcaster.name}
            </h3>
            {isMostPopular && (
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L12 8.5 6.8 9.6L7.7 14z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Most Popular</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Badge and Viewers */}
        <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isFree 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
          }`}>
            {isFree ? 'Free to Watch' : 'Subscription Required'}
          </span>
          
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-medium">{clickCount} viewers</span>
          </div>
        </div>

        {/* Row 3: CTA Button */}
        <div className="flex justify-center">
          {broadcaster.affiliate_url ? (
            <button
              onClick={handleClick}
              className={`
                w-full max-w-xs px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform group-hover:scale-105
                ${isMostPopular 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 focus:ring-yellow-500 shadow-lg hover:shadow-xl' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-md hover:shadow-lg'
                }
              `}
            >
              {isMostPopular ? '🔥 WATCH NOW' : 'WATCH NOW'}
            </button>
          ) : (
            <div className="w-full max-w-xs px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium text-center">
              No link available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
