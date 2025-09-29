"use client";
import { useState } from 'react';
import CompactBroadcasterRow from './CompactBroadcasterRow';

interface CompactBroadcasterSectionProps {
  broadcasters: any[];
  clickCounts: { [key: number]: number };
  mostPopularBroadcaster: any;
  onBroadcasterClick: (broadcasterId: number, matchId: number) => void;
  matchId: number;
}

export default function CompactBroadcasterSection({
  broadcasters,
  clickCounts,
  mostPopularBroadcaster,
  onBroadcasterClick,
  matchId
}: CompactBroadcasterSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
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

  const displayedBroadcasters = showAll ? broadcasters : broadcasters.slice(0, 5);
  const remainingCount = broadcasters.length - 5;

  return (
    <div className="space-y-1">
      {displayedBroadcasters.map((broadcaster: any) => (
        <CompactBroadcasterRow
          key={broadcaster.id}
          broadcaster={broadcaster}
          clickCount={clickCounts[broadcaster.id] || 0}
          isMostPopular={mostPopularBroadcaster && mostPopularBroadcaster.id === broadcaster.id}
          onBroadcasterClick={onBroadcasterClick}
          matchId={matchId}
        />
      ))}
      
      {/* Show More/Less Button */}
      {broadcasters.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 px-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
        >
          {showAll ? 'Show less' : `Show more (${remainingCount} more)`}
        </button>
      )}
    </div>
  );
}
