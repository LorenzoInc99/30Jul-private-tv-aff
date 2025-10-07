"use client";
import React, { useState, useRef, useEffect } from 'react';
import MobileTvCard from './MobileTvCard';

interface MobileWhereToWatchProps {
  broadcasters: any[];
  clickCounts: { [key: number]: number };
  onBroadcasterClick: (broadcasterId: number, matchId: string) => void;
  matchId: string;
}

export default function MobileWhereToWatch({ 
  broadcasters, 
  clickCounts, 
  onBroadcasterClick, 
  matchId 
}: MobileWhereToWatchProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Ensure hydration is complete before rendering dynamic content
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Transform broadcasters to include badge information - only after hydration
  const transformedBroadcasters = isHydrated ? broadcasters.map(broadcaster => ({
    ...broadcaster,
    isFree: broadcaster.name.toLowerCase().includes('free') || 
            broadcaster.name.toLowerCase().includes('youtube'),
    isPopular: (clickCounts[broadcaster.id] || 0) > 1000,
    isPaid: !broadcaster.name.toLowerCase().includes('free') && 
            !broadcaster.name.toLowerCase().includes('youtube'),
    isHd: broadcaster.name.toLowerCase().includes('hd') || 
          broadcaster.name.toLowerCase().includes('4k')
  })) : broadcasters;

  const handleScroll = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? (currentIndex - 1 + transformedBroadcasters.length) % transformedBroadcasters.length
      : (currentIndex + 1) % transformedBroadcasters.length;
    
    setCurrentIndex(newIndex);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent page scroll
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent page scroll
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent page scroll
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleScroll('right');
    } else if (isRightSwipe) {
      handleScroll('left');
    }
  };

  // Helper function to calculate circular distance and direction
  const getCircularDistanceAndDirection = (
    targetIndex: number,
    currentActiveIndex: number,
    totalItems: number
  ) => {
    const directDistance = targetIndex - currentActiveIndex;
    const wrappedDistance = directDistance > 0
      ? directDistance - totalItems
      : directDistance + totalItems;

    // Choose the shortest path
    if (Math.abs(directDistance) <= Math.abs(wrappedDistance)) {
      return { distance: directDistance, isLeft: directDistance < 0, isRight: directDistance > 0 };
    } else {
      return { distance: wrappedDistance, isLeft: wrappedDistance < 0, isRight: wrappedDistance > 0 };
    }
  };

  const getCardStyle = (index: number) => {
    const { distance, isLeft, isRight } = getCircularDistanceAndDirection(
      index,
      currentIndex,
      transformedBroadcasters.length
    );

    const absDistance = Math.abs(distance);

    if (absDistance === 0) { // Active card - make it bigger and ensure it's centered
      return {
        transform: 'translateX(0) scale(1.1) rotateY(0deg)',
        opacity: 1,
        zIndex: 10,
        filter: 'blur(0px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        left: '50%',
        marginLeft: '-104px', // Half of w-52 (208px) to center it
      };
    } else if (absDistance === 1) { // Adjacent cards
      const translateX = isLeft ? '-60%' : '60%';
      const scale = 0.8;
      const opacity = 0.6;
      const blur = '3px';
      const rotate = isLeft ? '-20deg' : '20deg';

      return {
        transform: `translateX(${translateX}) scale(${scale}) rotateY(${rotate})`,
        opacity,
        zIndex: 5,
        filter: `blur(${blur})`,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        left: '50%',
        marginLeft: '-104px', // Half of w-52 (208px) to center it
      };
    } else { // Distant cards
      const translateX = isLeft ? '-80%' : '80%';
      const scale = 0.6;
      const opacity = 0.3;
      const blur = '6px';
      const rotate = isLeft ? '-30deg' : '30deg';

      return {
        transform: `translateX(${translateX}) scale(${scale}) rotateY(${rotate})`,
        opacity,
        zIndex: 1,
        filter: `blur(${blur})`,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        left: '50%',
        marginLeft: '-104px', // Half of w-52 (208px) to center it
      };
    }
  };

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="w-full px-4 pt-2 pb-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pt-2 pb-4">
      {/* Horizontal Carousel Container */}
      <div className="relative w-full">
        {/* Navigation Arrows */}
        {transformedBroadcasters.length > 1 && (
          <>
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Cards Container */}
        <div 
          ref={scrollRef}
          className="relative h-64 w-full flex items-center justify-center overflow-visible touch-pan-y"
          style={{ 
            perspective: '1000px',
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            minHeight: '256px',
            paddingLeft: 'clamp(40px, 15vw, 80px)',
            paddingRight: 'clamp(40px, 15vw, 80px)'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {transformedBroadcasters.length > 0 ? (
            transformedBroadcasters.map((broadcaster, index) => (
              <div
                key={broadcaster.id}
                className="absolute w-52 h-64 sm:w-56 sm:h-72 transition-all duration-500 ease-out"
                style={getCardStyle(index)}
              >
                <MobileTvCard
                  broadcaster={broadcaster}
                  clickCount={clickCounts[broadcaster.id] || 0}
                  onBroadcasterClick={onBroadcasterClick}
                  matchId={matchId}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>No broadcasters available</p>
            </div>
          )}
        </div>

        {/* Dots Indicator */}
        {transformedBroadcasters.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {transformedBroadcasters.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-500 w-6' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
