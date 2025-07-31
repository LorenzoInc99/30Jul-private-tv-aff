import React from 'react';
import Image from 'next/image';

interface CountryFlagProps {
  flagUrl?: string | null;
  imagePath?: string | null;
  countryName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CountryFlag({ flagUrl, imagePath, countryName, size = 'sm', className = '' }: CountryFlagProps) {
  // Standard flag aspect ratio (3:2) - most country flags use this ratio
  const sizeClasses = {
    sm: 'w-6 h-4',    // 24x16px (3:2 ratio)
    md: 'w-9 h-6',    // 36x24px (3:2 ratio)
    lg: 'w-12 h-8'    // 48x32px (3:2 ratio)
  };

  const sizeClass = sizeClasses[size];

  const flagSrc = flagUrl || imagePath;
  
  if (!flagSrc) {
    // Fallback: Show first letter of country name in a rectangle
    return (
      <div className={`${sizeClass} ${className} flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold`}>
        {countryName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className} relative flex items-center justify-center overflow-hidden rounded border border-gray-200 dark:border-gray-600`}>
      <Image
        src={flagSrc}
        alt={`${countryName} flag`}
        width={size === 'sm' ? 24 : size === 'md' ? 36 : 48}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to letter if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                ${countryName.charAt(0).toUpperCase()}
              </div>
            `;
          }
        }}
      />
    </div>
  );
} 