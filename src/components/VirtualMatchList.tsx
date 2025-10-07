'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import LazyMatchCard from './LazyMatchCard';
import { EmptyState } from './EmptyStates';

interface VirtualMatchListProps {
  matches: any[];
  timezone: string;
  starredMatches: string[];
  onStarToggle: (matchId: string) => void;
  showOdds?: boolean;
  showTv?: boolean;
  useShortDateFormat?: boolean;
  homePageFormat?: boolean;
  className?: string;
}

export default function VirtualMatchList({
  matches,
  timezone,
  starredMatches,
  onStarToggle,
  showOdds = true,
  showTv = true,
  useShortDateFormat = false,
  homePageFormat = false,
  className = ''
}: VirtualMatchListProps) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Match card height (estimated)
  const ITEM_HEIGHT = 80;
  const OVERSCAN = 5; // Number of items to render outside visible area

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      matches.length - 1,
      Math.floor((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, matches.length]);

  // Get visible matches
  const visibleMatches = useMemo(() => {
    return matches.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [matches, visibleRange]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate total height and offset
  const totalHeight = matches.length * ITEM_HEIGHT;
  const offsetY = visibleRange.startIndex * ITEM_HEIGHT;

  if (matches.length === 0) {
    return (
      <div className={className}>
        <EmptyState 
          type="no-matches" 
          activeTab="today"
          onAction={() => {
            // Default action - go to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedDate', today.toISOString());
              window.location.reload();
            }
          }}
          actionText="Explore Today's Matches"
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100vh' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleMatches.map((match, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div key={match.id} style={{ height: ITEM_HEIGHT }}>
                <LazyMatchCard
                  match={match}
                  timezone={timezone}
                  isExpanded={false}
                  showOdds={showOdds}
                  showTv={showTv}
                  isStarred={starredMatches.includes(match.id)}
                  onStarToggle={onStarToggle}
                  onExpandToggle={() => {}}
                  onClick={() => {
                    const homeSlug = match.home_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'home';
                    const awaySlug = match.away_team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'away';
                    const matchUrl = `/match/${match.id}-${homeSlug}-vs-${awaySlug}`;
                    window.open(matchUrl, '_blank');
                  }}
                  useShortDateFormat={useShortDateFormat}
                  homePageFormat={homePageFormat}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
