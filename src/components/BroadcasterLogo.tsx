import React from 'react';
import Image from 'next/image';

interface BroadcasterLogoProps {
  logoUrl?: string | null;
  broadcasterName: string;
  affiliateUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export default function BroadcasterLogo({ 
  logoUrl, 
  broadcasterName, 
  affiliateUrl, 
  size = 'md', 
  className = '',
  showLabel = true
}: BroadcasterLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const sizeClass = sizeClasses[size];

  const logoElement = (
    <div className={`${sizeClass} ${className} flex flex-col items-center`}>
      <div className="relative flex items-center justify-center w-full h-full">
        {!logoUrl ? (
          // Fallback: Show first letter of broadcaster name in a circle
          <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
            {broadcasterName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Image
            src={logoUrl}
            alt={`${broadcasterName} logo`}
            width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            className="w-full h-full object-contain rounded bg-white border border-gray-200 dark:border-gray-700"
            onError={(e) => {
              // Fallback to letter if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                    ${broadcasterName.charAt(0).toUpperCase()}
                  </div>
                `;
              }
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-700 dark:text-gray-300 text-center font-medium mt-1">
          {broadcasterName}
        </span>
      )}
    </div>
  );

  if (affiliateUrl) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-105 transition-transform duration-200"
        aria-label={`Watch on ${broadcasterName}`}
      >
        {logoElement}
      </a>
    );
  }

  return logoElement;
} 