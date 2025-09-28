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
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [showCountryList, setShowCountryList] = useState(false);

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

  // Mock data for geographic coverage (replace with real data later)
  const countries = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹'];
  const displayCountries = countries.slice(0, 3);
  const hasMoreCountries = countries.length > 3;

  // Badge data with descriptions
  const badges = [
    {
      id: 'subscription',
      label: isFree ? 'Free' : 'Paid',
      description: isFree ? 'Free to watch content' : 'Subscription required',
      color: isFree ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
    },
    {
      id: 'popular',
      label: 'Popular',
      description: 'Most watched broadcaster',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      show: isMostPopular
    },
    {
      id: 'hd',
      label: 'HD',
      description: 'High definition quality available',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    }
  ].filter(badge => badge.show !== false);

  return (
    <div className="relative h-48"> {/* Fixed height container */}
      <div className={`
        group relative rounded-lg border-2 transition-all duration-300 h-full flex flex-col
        ${isMostPopular 
          ? 'border-yellow-400 shadow-yellow-200 dark:shadow-yellow-900/30' 
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-gray-200 dark:shadow-gray-900/50'
        }
      `}>
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90"></div>
        
        {/* Hover Background Effect */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isMostPopular ? 'bg-yellow-200 dark:bg-yellow-800/30' : 'bg-indigo-200 dark:bg-indigo-800/30'}
        `}></div>
        
        {/* Row Content - 3 Row Layout with fixed heights */}
        <div className="relative p-3 flex flex-col h-full">
          {/* Row 1: Logo and Name - Fixed height */}
          <div className="flex items-center space-x-3 mb-2 h-12">
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
            
            {/* Name - Truncated with smaller font for long names */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h3 className={`
                font-semibold text-gray-900 dark:text-white truncate
                ${broadcaster.name.length > 12 ? 'text-sm' : 'text-base'}
              `}
              title={broadcaster.name} // Show full name on hover
              >
                {broadcaster.name}
              </h3>
            </div>
          </div>

          {/* Row 2: Badges and Geographic Indicators - Fixed height */}
          <div className="flex items-center justify-between mb-3 h-8">
            {/* Badges Row - Left Aligned */}
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              {badges.map((badge) => (
                <div key={badge.id} className="relative flex-shrink-0">
                  <span 
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium cursor-help transition-colors duration-200 ${badge.color}`}
                    onMouseEnter={() => setHoveredBadge(badge.id)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    {badge.label}
                  </span>
                  {/* Badge Tooltip - Positioned above the badge */}
                  {hoveredBadge === badge.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-[9999]">
                      {badge.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Geographic Indicators - Right Aligned */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {displayCountries.map((flag, index) => (
                <span key={index} className="text-sm">{flag}</span>
              ))}
              {hasMoreCountries && (
                <div className="relative">
                  <span 
                    className="text-sm cursor-help"
                    onMouseEnter={() => setShowCountryList(true)}
                    onMouseLeave={() => setShowCountryList(false)}
                  >
                    +{countries.length - 3}
                  </span>
                  {/* Country List Tooltip - Positioned above the + indicator */}
                  {showCountryList && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-[9999]">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {countries.map((country, index) => (
                          <span key={index}>{country}</span>
                        ))}
                      </div>
                      <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: CTA Button - Fixed height and flex-grow to push to bottom */}
          <div className="flex justify-center mt-auto">
            {broadcaster.affiliate_url ? (
              <button
                onClick={handleClick}
                className={`
                  w-full px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer
                  ${isMostPopular 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 focus:ring-yellow-500 shadow-lg hover:shadow-xl' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-md hover:shadow-lg'
                  }
                `}
              >
                {isMostPopular ? '🔥 WATCH NOW' : 'WATCH NOW'}
              </button>
            ) : (
              <div className="w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium text-center">
                No link available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}