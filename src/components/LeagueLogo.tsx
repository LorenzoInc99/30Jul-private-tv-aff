import React from 'react';
import Image from 'next/image';
import { getLeagueLogoClassName } from '../lib/utils';

interface LeagueLogoProps {
  logoUrl?: string | null;
  leagueName: string;
  leagueId?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function LeagueLogo({ logoUrl, leagueName, leagueId, size = 'sm', className = '' }: LeagueLogoProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-24 h-24'
  };

  const sizeClass = sizeClasses[size];

  if (!logoUrl) {
    // Fallback: Show first letter of league name in a circle
    return (
      <div className={`${sizeClass} ${className} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold`}>
        {leagueName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className} relative flex items-center justify-center`}>
      <Image
        src={logoUrl}
        alt={`${leagueName} logo`}
        width={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 96}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 96}
        className={getLeagueLogoClassName(leagueId || 0, className)}
        onError={(e) => {
          // Fallback to letter if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                ${leagueName.charAt(0).toUpperCase()}
              </div>
            `;
          }
        }}
      />
    </div>
  );
} 