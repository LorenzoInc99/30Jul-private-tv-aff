import React from 'react';
import Image from 'next/image';

interface TeamLogoProps {
  logoUrl?: string | null;
  teamName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function TeamLogo({ logoUrl, teamName, size = 'sm', className = '' }: TeamLogoProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-24 h-24'
  };

  const sizeClass = sizeClasses[size];

  if (!logoUrl) {
    // Fallback: Show first letter of team name in a circle
    return (
      <div className={`${sizeClass} ${className} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold`}>
        {teamName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className} relative flex items-center justify-center`}>
      <Image
        src={logoUrl}
        alt={`${teamName} logo`}
        width={size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 96}
        height={size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 96}
        className="object-contain"
        onError={(e) => {
          // Fallback to letter if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                ${teamName.charAt(0).toUpperCase()}
              </div>
            `;
          }
        }}
      />
    </div>
  );
} 