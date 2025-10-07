'use client';

import { useState, useRef, useEffect } from 'react';
import MatchCard from './MatchCard';

interface LazyMatchCardProps {
  match: any;
  timezone: string;
  isExpanded?: boolean;
  showOdds?: boolean;
  showTv?: boolean;
  isStarred?: boolean;
  onStarToggle?: (matchId: string) => void;
  onExpandToggle?: () => void;
  onClick?: () => void;
  useShortDateFormat?: boolean;
  homePageFormat?: boolean;
}

export default function LazyMatchCard(props: LazyMatchCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Load the component after a small delay to improve perceived performance
          setTimeout(() => {
            setHasLoaded(true);
          }, 100);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before the element comes into view
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="w-full">
      {isVisible ? (
        hasLoaded ? (
          <MatchCard {...props} />
        ) : (
          <MatchCardSkeleton />
        )
      ) : (
        <MatchCardSkeleton />
      )}
    </div>
  );
}

// Skeleton component for loading state
function MatchCardSkeleton() {
  return (
    <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="flex items-center gap-1 p-2 h-full">
        {/* Date/Time skeleton */}
        <div className="w-11 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        
        {/* Teams skeleton */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        </div>
        
        {/* Odds/TV skeleton */}
        <div className="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
