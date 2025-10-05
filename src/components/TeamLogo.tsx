import React from 'react';
import Image from 'next/image';

interface TeamLogoProps {
  logoUrl?: string | null;
  teamName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export default function TeamLogo({ logoUrl, teamName, size = 'sm', className = '' }: TeamLogoProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
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

  const imageSize = size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : size === 'xl' ? 80 : 96;
  
  return (
    <div className={`${sizeClass} ${className} relative flex items-center justify-center`} style={{ minWidth: imageSize, minHeight: imageSize }}>
      <Image
        src={logoUrl}
        alt={`${teamName} logo`}
        width={imageSize}
        height={imageSize}
        className="object-contain"
        loading={size === 'xl' ? 'eager' : 'lazy'}
        priority={size === 'xl'}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        sizes={`${imageSize}px`}
        style={{ width: '100%', height: '100%' }}
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