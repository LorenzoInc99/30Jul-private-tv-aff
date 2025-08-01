import React from 'react';
import Image from 'next/image';

interface BookmakerLogoProps {
  logoUrl?: string | null;
  bookmakerName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BookmakerLogo({ 
  logoUrl, 
  bookmakerName, 
  size = 'md', 
  className = '' 
}: BookmakerLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const sizeClass = sizeClasses[size];

  if (!logoUrl) {
    // Fallback: Show first letter of bookmaker name in a circle
    return (
      <div className={`${sizeClass} ${className} flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold border border-indigo-200 dark:border-indigo-700`}>
        {bookmakerName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className} relative flex items-center justify-center`}>
      <Image
        src={logoUrl}
        alt={`${bookmakerName} logo`}
        width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
        className="object-contain rounded-lg bg-white border border-gray-200 dark:border-gray-700"
        onError={(e) => {
          // Fallback to letter if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold border border-indigo-200 dark:border-indigo-700">
                ${bookmakerName.charAt(0).toUpperCase()}
              </div>
            `;
          }
        }}
      />
    </div>
  );
} 