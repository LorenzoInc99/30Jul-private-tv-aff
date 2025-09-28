"use client";
import { useState, useRef, useEffect } from 'react';
import BroadcasterRow from './BroadcasterRow';

interface SwipeableBroadcasterSectionProps {
  broadcasters: any[];
  clickCounts: { [key: number]: number };
  mostPopularBroadcaster: any;
  onBroadcasterClick: (broadcasterId: number, matchId: number) => void;
  matchId: number;
}

export default function SwipeableBroadcasterSection({
  broadcasters,
  clickCounts,
  mostPopularBroadcaster,
  onBroadcasterClick,
  matchId
}: SwipeableBroadcasterSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate how many items to show per view
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 2; // SSR fallback
    
    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile: 1 item
    if (width < 1024) return 2; // Tablet: 2 items
    return 2; // Desktop: 2 items
  };

  const itemsPerView = getItemsPerView();
  const maxIndex = Math.max(0, broadcasters.length - itemsPerView);

  // Handle touch/mouse events for swiping
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const x = clientX;
    const walk = (startX - x) * 2; // Scroll speed multiplier
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft + walk;
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest item
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / broadcasters.length;
      const newIndex = Math.round(container.scrollLeft / itemWidth);
      const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));
      
      setCurrentIndex(clampedIndex);
      container.scrollTo({
        left: clampedIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    handleEnd();
  };

  // Navigation functions
  const goToSlide = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / broadcasters.length;
      container.scrollTo({
        left: clampedIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    goToSlide(currentIndex + 1);
  };

  const prevSlide = () => {
    goToSlide(currentIndex - 1);
  };

  // Update current index when scroll changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const itemWidth = container.scrollWidth / broadcasters.length;
      const newIndex = Math.round(container.scrollLeft / itemWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, maxIndex)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [broadcasters.length, maxIndex]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      const newMaxIndex = Math.max(0, broadcasters.length - newItemsPerView);
      setCurrentIndex(Math.min(currentIndex, newMaxIndex));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [broadcasters.length, currentIndex]);

  if (broadcasters.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📺</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Broadcasting details will be confirmed closer to kick-off
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {broadcasters.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`
              absolute left-2 top-1/2 transform -translate-y-1/2 z-10
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200
              ${currentIndex === 0 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl'
              }
            `}
            aria-label="Previous broadcasters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`
              absolute right-2 top-1/2 transform -translate-y-1/2 z-10
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200
              ${currentIndex >= maxIndex 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl'
              }
            `}
            aria-label="Next broadcasters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className={`
          flex overflow-x-auto scrollbar-hide
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${broadcasters.length > itemsPerView ? 'px-12' : ''}
        `}
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: isDragging ? 'auto' : 'smooth'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {broadcasters.map((broadcaster, index) => (
          <div
            key={broadcaster.id}
            className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/2 px-2 h-48"
            style={{ scrollSnapAlign: 'start' }}
          >
            <BroadcasterRow
              broadcaster={broadcaster}
              clickCount={clickCounts[broadcaster.id] || 0}
              isMostPopular={mostPopularBroadcaster && mostPopularBroadcaster.id === broadcaster.id}
              onBroadcasterClick={onBroadcasterClick}
              matchId={matchId}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {broadcasters.length > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentIndex 
                  ? 'bg-indigo-600 dark:bg-indigo-400 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
