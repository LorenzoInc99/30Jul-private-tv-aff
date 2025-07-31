import React from 'react';
import Image from 'next/image';

interface TeamLogoProps {
  logoUrl?: string | null;
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TeamLogo({ logoUrl, teamName, size = 'sm', className = '' }: TeamLogoProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
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
        width={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        className="rounded-full object-cover"
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